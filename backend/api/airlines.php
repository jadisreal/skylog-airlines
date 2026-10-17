<?php
require __DIR__ . '/../db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $code, $data): void
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function find(int $id): ?array
{
    $st = db()->prepare('SELECT * FROM airlines WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

// Returns [cleanData, errors].
function validate(array $in): array
{
    $s = fn($k) => trim((string)($in[$k] ?? ''));
    $d = [
        'name' => $s('name'),
        'iata_code' => strtoupper($s('iata_code')),
        'icao_code' => strtoupper($s('icao_code')),
        'country' => $s('country'),
        'hub_airport' => strtoupper($s('hub_airport')),
        'hub_city' => $s('hub_city'),
        'founded_year' => $s('founded_year'),
        'status' => $s('status'),
        'website' => $s('website'),
    ];
    $e = [];
    foreach (['name', 'iata_code', 'icao_code', 'country', 'hub_airport', 'hub_city', 'founded_year', 'status'] as $k) {
        if ($d[$k] === '') $e[$k] = 'Required';
    }
    if (mb_strlen($d['name']) > 100) $e['name'] = 'Max 100 characters';
    if (mb_strlen($d['country']) > 60) $e['country'] = 'Max 60 characters';
    if (mb_strlen($d['hub_city']) > 60) $e['hub_city'] = 'Max 60 characters';
    if (!isset($e['iata_code']) && !preg_match('/^[A-Z0-9]{2}$/', $d['iata_code'])) $e['iata_code'] = 'Must be 2 letters or digits';
    if (!isset($e['icao_code']) && !preg_match('/^[A-Z]{3}$/', $d['icao_code'])) $e['icao_code'] = 'Must be 3 letters';
    if (!isset($e['hub_airport']) && !preg_match('/^[A-Z]{3}$/', $d['hub_airport'])) $e['hub_airport'] = 'Must be 3 letters';
    $max = (int)date('Y');
    if (!isset($e['founded_year'])) {
        if (!preg_match('/^\d{4}$/', $d['founded_year']) || $d['founded_year'] < 1900 || $d['founded_year'] > $max) {
            $e['founded_year'] = "Must be between 1900 and $max";
        }
    }
    if (!isset($e['status']) && !in_array($d['status'], ['Active', 'Inactive'], true)) $e['status'] = 'Must be Active or Inactive';
    if ($d['website'] === '') {
        $d['website'] = null;
    } elseif (mb_strlen($d['website']) > 200 || !filter_var($d['website'], FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $d['website'])) {
        $e['website'] = 'Must be a valid http(s) URL';
    }
    $d['founded_year'] = (int)$d['founded_year'];
    return [$d, $e];
}

function readBody(): array
{
    $in = json_decode(file_get_contents('php://input'), true);
    if (!is_array($in)) respond(400, ['errors' => ['body' => 'Invalid JSON body']]);
    [$d, $e] = validate($in);
    if ($e) respond(400, ['errors' => $e]);
    return $d;
}

// Runs an INSERT/UPDATE, turning a unique-key violation into 409.
function save(string $sql, array $params): void
{
    try {
        db()->prepare($sql)->execute($params);
    } catch (PDOException $ex) {
        if ($ex->getCode() !== '23000') throw $ex;
        $field = str_contains($ex->getMessage(), 'icao_code') ? 'icao_code' : 'iata_code';
        respond(409, ['errors' => [$field => 'Already used by another airline']]);
    }
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$cols = 'name, iata_code, icao_code, country, hub_airport, hub_city, founded_year, status, website';

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($id === null) respond(200, db()->query('SELECT * FROM airlines ORDER BY created_at DESC, id DESC')->fetchAll());
            respond(200, find($id) ?? respond(404, ['error' => 'Not found']));
        case 'POST':
            $d = readBody();
            save("INSERT INTO airlines ($cols) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", array_values($d));
            respond(201, find((int)db()->lastInsertId()));
        case 'PUT':
            if ($id === null || !find($id)) respond(404, ['error' => 'Not found']);
            $d = readBody();
            save('UPDATE airlines SET name=?, iata_code=?, icao_code=?, country=?, hub_airport=?, hub_city=?, founded_year=?, status=?, website=? WHERE id=?', [...array_values($d), $id]);
            respond(200, find($id));
        case 'DELETE':
            if ($id === null || !find($id)) respond(404, ['error' => 'Not found']);
            db()->prepare('DELETE FROM airlines WHERE id = ?')->execute([$id]);
            respond(200, ['deleted' => true]);
        default:
            respond(405, ['error' => 'Method not allowed']);
    }
} catch (PDOException $ex) {
    respond(500, ['error' => 'Database error']);
}
