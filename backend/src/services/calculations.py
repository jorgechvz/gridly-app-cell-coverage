def link_budget(Ptx, Gtx, Grx, f, distance_km, L_pl, L_cerb, Margin, s_em):
    """
    Calculate the link budget for a given distance and frequency.
    """
    from .distance import calculate_FSPL_dB, calculate_power_received

    L_fsl = calculate_FSPL_dB(distance_km, f)
    L_total = L_fsl + L_pl + L_cerb + Margin
    Prx_val = calculate_power_received(Ptx, Gtx, Grx, L_fsl, L_pl + L_cerb + Margin)
    return {
        "L_fsl": L_fsl,
        "L_total": L_total,
        "Prx": Prx_val,
        "Link_margin": Prx_val - s_em,
    }
