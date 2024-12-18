from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel
from ..services.distance import (
    calculate_FSPL_dB,
    calculate_distance,
    calculate_power_received,
)
from ..services.propagation import urban_loss, suburban_loss, rural_loss, distance_oh
from ..services.gain import calculate_G
from ..services.calculations import link_budget

router = APIRouter()


# Model to input parameters
class FSPLInput(BaseModel):
    Ptx: float
    Gtx: float
    Grx: float
    f: float
    distance_km: float
    L_extra: float = 0


class OkumuraHataInput(BaseModel):
    f: float
    h_b: float
    h_m: float
    L_fsl_max: float


class AntennaGainInput(BaseModel):
    G0: float
    theta: float
    k: float = 0
    theta_3: float = 10
    theta_4: float = 5


class FullLinkBudgetInput(BaseModel):
    Ptx: float
    Gtx: float
    Grx: float
    f: float
    distance_km: float
    L_pl: float
    L_cerb: float
    Margin: float
    s_em: float


@router.post("/coverage/fspl")
def get_fspl_results(request: FSPLInput):
    """
    Calcula FSPL y potencia recibida dado potencia, ganancia, frecuencia y distancia.
    Parámetros desde un JSON en el body conforme a FSPLInput.
    """
    L_fsl = calculate_FSPL_dB(request.distance_km, request.f)
    Prx_val = calculate_power_received(
        request.Ptx, request.Gtx, request.Grx, L_fsl, request.L_extra
    )
    return {"L_fsl": L_fsl, "Prx": Prx_val}


@router.post("/coverage/okumura_hata")
def get_okumura_hata_coverage(request: OkumuraHataInput):
    """
    Calcula distancia máxima en escenarios urbano, suburbano, rural según Okumura-Hata.
    Parámetros desde un JSON en el body conforme a OkumuraHataInput.
    """
    Lb_urban_1km = urban_loss(request.f, request.h_b, request.h_m, 1)
    Lb_suburban_1km = suburban_loss(request.f, Lb_urban_1km)
    Lb_rural_1km = rural_loss(request.f, Lb_urban_1km)

    d_urban_max = distance_oh(request.L_fsl_max, 0, request.f, request.h_b, request.h_m)
    d_suburban_max = distance_oh(
        request.L_fsl_max,
        Lb_suburban_1km - Lb_urban_1km,
        request.f,
        request.h_b,
        request.h_m,
    )
    d_rural_max = distance_oh(
        request.L_fsl_max,
        Lb_rural_1km - Lb_urban_1km,
        request.f,
        request.h_b,
        request.h_m,
    )

    return {
        "urban_max_km": d_urban_max,
        "suburban_max_km": d_suburban_max,
        "rural_max_km": d_rural_max,
    }


@router.post("/coverage/antenna_gain")
def get_antenna_gain(request: AntennaGainInput):
    """
    Calcula la ganancia de la antena a un cierto ángulo.
    Parámetros desde un JSON en el body conforme a AntennaGainInput.
    """
    G = calculate_G(
        request.theta, request.G0, request.k, request.theta_3, request.theta_4
    )
    return {"Ganancia_dBi": G}


@router.post("/coverage/full_link_budget")
def get_full_link_budget(request: FullLinkBudgetInput):
    """
    Cálculo completo del link budget.
    Parámetros desde un JSON en el body conforme a FullLinkBudgetInput.
    """
    result = link_budget(
        request.Ptx,
        request.Gtx,
        request.Grx,
        request.f,
        request.distance_km,
        request.L_pl,
        request.L_cerb,
        request.Margin,
        request.s_em,
    )
    return result
