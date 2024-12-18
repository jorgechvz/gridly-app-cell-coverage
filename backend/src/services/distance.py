import math
import numpy as np


def calculate_distance(FSPL_dB, frequency):
    """
    Calculate distance using the Free Space Path Loss (FSPL) formula.
    """
    return 10 ** ((FSPL_dB - 20 * math.log10(frequency) - 32.44) / 20)


def calculate_FSPL_dB(distance, frequency):
    """
    Calculate the Free Space Path Loss (FSPL) in dB.
    """
    c = 3e8
    return (
        20 * np.log10(distance)
        + 20 * np.log10(frequency)
        + 20 * np.log10(4 * np.pi / c)
    )


def calculate_power_received(Ptx, Gtx, Grx, fspl, L_total):
    """
    Calculate the received power in dBm.
    """
    return Ptx + Gtx + Grx - fspl - L_total
