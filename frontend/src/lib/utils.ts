import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function distanceOh(
  L_fsl: number,
  Lb_area: number,
  f: number,
  h_b: number
): number {
  return (
    10 **
    ((L_fsl -
      Lb_area -
      69.55 -
      26.16 * Math.log10(f) +
      13.82 * Math.log10(h_b)) /
      (44.9 - 6.55 * Math.log10(h_b)))
  );
}

export function aHmSmallMediumCity(f: number, h_m: number): number {
  return (1.1 * Math.log10(f) - 0.7) * h_m - (1.56 * Math.log10(f) - 0.8);
}

export function aHmLargeCity(f: number, h_m: number): number {
  if (f <= 200) {
    return 8.29 * Math.log10(1.54 * h_m) ** 2 - 1.1;
  } else if (f >= 400) {
    return 3.2 * Math.log10(11.75 * h_m) ** 2 - 4.97;
  } else {
    throw new Error(
      "Frequency out of range for large cities (200 <= f <= 400)"
    );
  }
}

export function urban_loss(
  f: number,
  h_b: number,
  h_m: number,
  d_m: number,
  largeCity: boolean = false
): number {
  const a_hm = largeCity ? aHmLargeCity(f, h_m) : aHmSmallMediumCity(f, h_m);
  return (
    69.55 +
    26.16 * Math.log10(f) -
    13.82 * Math.log10(h_b) -
    a_hm +
    (44.9 - 6.55 * Math.log10(h_b)) * Math.log10(d_m)
  );
}

export function suburban_loss(f: number, LbUrban: number): number {
  return LbUrban - 2 * Math.log10(f / 28) ** 2 - 5.4;
}

export function rural_loss(f: number, LbUrban: number): number {
  return LbUrban - 4.78 * Math.log10(f) ** 2 + 18.33 * Math.log10(f) - 40.94;
}

// Sectoral Azimuth Gain calculations
export function Ghr(
  theta: number,
  phi_3: number,
  kh: number,
  lambda_kh: number
): number {
  const xh = Math.abs(theta) / phi_3;
  if (xh <= 0.5) {
    return -12 * xh ** 2;
  } else {
    return -12 * xh ** (2 - kh) - lambda_kh;
  }
}

export function Gvr(
  phi: number,
  kv: number,
  theta_3: number,
  kp: number
): number {
  const C = calculateC(theta_3, kp, kv);
  const lambda_kv = calculateLambdaKv(C, kv);
  const xk = Math.sqrt(1 - 0.36 * kv);
  const xv = Math.abs(phi) / theta_3;

  if (xv < xk) {
    return -12 * xv ** 2;
  } else if (xv < 4) {
    return -12 + 10 * Math.log10(xv ** -1.5 + kv);
  } else {
    return -lambda_kv - C * Math.log10(xv);
  }
}

export function calculateLambdaKv(C: number, kv: number): number {
  return 12 - C * Math.log10(4) - 10 * Math.log10(4 ** -1.5 + kv);
}

export function calculateC(theta_3: number, kp: number, kv: number): number {
  return (
    (10 *
      Math.log10(((180 / theta_3) ** 1.5 * (4 ** -1.5 + kv)) / (1 + 8 * kp))) /
    Math.log10(22.5 / theta_3)
  );
}
