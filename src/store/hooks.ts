import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/** Typed Redux hooks — prefer these over raw useDispatch/useSelector for type safety. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
