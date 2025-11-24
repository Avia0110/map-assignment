from fastapi import APIRouter

from app import state
from app.models.schemas import AxisRange, UserClick, DistanceAngle, MapImage
from app.services.math_service import compute_distance_and_angle

router = APIRouter(
    prefix="/mode1",
    tags=["mode1"],
)

@router.get("/")
async def root():
    return {"message": "OK"}

@router.post("/axis-range")
async def set_axis_range(config: AxisRange):
    state.axis_range = config
    return {"message": "axis range updated", "axis_range":state.axis_range}

@router.post("/map-image")
async def set_map_image(image: MapImage):
    state.map_image = image
    return{"message":"map image updated", "map_image":state.map_image}

@router.post("/click", response_model=DistanceAngle)
async def handle_click(click: UserClick):

    #in case axis_range isn't set yet
    if state.axis_range is None:
        return DistanceAngle(
            x = 0.0,
            y = 0.0,
            distance = 0.0,
            angle_degrees = 0.0
        )

    return compute_distance_and_angle(click, state.axis_range)