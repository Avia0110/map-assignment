from pydantic import BaseModel

class AxisRange(BaseModel):
    x_min: float
    x_max: float
    y_min: float
    y_max: float

class UserClick(BaseModel):
    px: float #user's point x pixels
    py: float
    image_width: float
    image_height: float

class DistanceAngle(BaseModel):
    x: float  #user's click on the axis with limits from user
    y: float
    distance: float
    angle_degrees: float

class MapImage(BaseModel):
    link: str


######################MODE2
class GPSPoint(BaseModel):
    lat: float   # latitude
    lon: float   # longitude

class Mode2Calibration(BaseModel):
    #pixel position of the two reference points
    p1_px: float
    p1_py: float
    p2_px: float
    p2_py: float

    #gps coordinates for these points
    p1_lat: float
    p1_lon: float
    p2_lat: float
    p2_lon: float

class Mode2Click(BaseModel):
    px: float
    py: float
    image_width: float
    image_height: float

class Mode2ClickResult(BaseModel):
    lat: float
    lon: float
