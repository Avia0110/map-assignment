from fastapi import APIRouter

from app import state
from app.models.schemas import Mode2Calibration, Mode2Click, Mode2ClickResult
from app.services.gps_service import compute_gps_from_click

router = APIRouter(
    prefix="/mode2",
    tags=["mode2"],
)

@router.post("/calibration")
async def set_mode2_calibration(config: Mode2Calibration):

    #save Mode 2 calibration: two pixel points + their GPS coordinates.
    state.mode2_calibration = config
    return {"message": "mode2 calibration updated"}

@router.post("/click", response_model=Mode2ClickResult)
async def handle_mode2_click(click: Mode2Click):

    #convert a click on the image to GPS coordinates using stored calibration.
    if state.mode2_calibration is None:
        #no calibration yet → return some default
        return Mode2ClickResult(lat=0.0, lon=0.0)

    return compute_gps_from_click(click, state.mode2_calibration)
