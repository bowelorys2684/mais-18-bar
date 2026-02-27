import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  type: 'casais' | 'solteiros' | 'tematica';
}

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  category: 'drinks' | 'vinhos' | 'petiscos';
}
