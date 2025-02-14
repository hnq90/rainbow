import { useSelector } from 'react-redux';
import { AppState } from '@/redux/store';

export default function useTopMovers() {
  return useSelector((state: AppState) => state.topMovers);
}
