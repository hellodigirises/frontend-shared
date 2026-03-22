import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/** Typed dispatch hook — use instead of plain useDispatch */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector hook — use instead of plain useSelector */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

/** Shortcut: returns the entire superadmin slice */
export const useSuperAdmin = () =>
  useAppSelector(state => state.superadmin);