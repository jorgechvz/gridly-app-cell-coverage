import numpy as np


def calculate_G(theta, G_0, k=0, theta_3=10, theta_4=5):
    """
    Calculate the gain in dB for an omnidirectional antenna.
    """
    theta_abs = np.abs(theta)
    if theta_abs < theta_4:
        return G_0 - 12 * (theta_abs / theta_3) ** 2
    elif theta_abs < theta_3:
        return G_0 - 12 + 10 * np.log10(k + 1)
    elif theta_abs <= 90:
        return G_0 - 12 + 10 * np.log10((theta_abs / theta_3) ** -1.5 + k)
    else:
        return -100
