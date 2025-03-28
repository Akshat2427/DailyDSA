import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
    console.log(clsx(inputs));
  return twMerge(clsx(inputs));
}