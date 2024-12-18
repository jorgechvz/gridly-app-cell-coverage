import math
import numpy as np


def a_hm_small_medium_city(f, h_m):
    return (1.1 * np.log10(f) - 0.7) * h_m - (1.56 * np.log10(f) - 0.8)


def a_hm_large_city(f, h_m):
    if f <= 200:
        return 8.29 * (np.log10(1.54 * h_m)) ** 2 - 1.1
    elif f >= 400:
        return 3.2 * (np.log10(11.75 * h_m)) ** 2 - 4.97
    else:
        raise ValueError("F fuera de rango para esta fórmula.")


def urban_loss(f, h_b, h_m, d_km, large_city=False):
    if large_city:
        a_hm = a_hm_large_city(f, h_m)
    else:
        a_hm = a_hm_small_medium_city(f, h_m)

    return (
        69.55
        + 26.16 * np.log10(f)
        - 13.82 * np.log10(h_b)
        - a_hm
        + (44.9 - 6.55 * np.log10(h_b)) * np.log10(d_km)
    )


def suburban_loss(f, Lb_urban):
    return Lb_urban - 2 * (np.log10(f / 28)) ** 2 - 5.4


def rural_loss(f, Lb_urban):
    return Lb_urban - 4.78 * (np.log10(f)) ** 2 + 18.33 * np.log10(f) - 40.94


def distance_oh(L_fsl, Lb_area, f, h_b, h_m):
    """
    Inversa aproximada del modelo Okumura-Hata.
    Se asume L_fsl = Lb_area + ...
    """
    return 10 ** (
        (L_fsl - Lb_area - 69.55 - 26.16 * np.log10(f) + 13.82 * np.log10(h_b))
        / (44.9 - 6.55 * np.log10(h_b))
    )
