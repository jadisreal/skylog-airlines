import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Airline } from "./api/airlines";

export type RootStackParamList = {
  AirlineList: undefined;
  AirlineDetail: { id: number };
  AirlineForm: { airline?: Airline };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
