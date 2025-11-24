import math

from app.models.schemas import UserClick, AxisRange, DistanceAngle


def compute_distance_and_angle(click: UserClick, axis_range: AxisRange) -> DistanceAngle:
#normalization from pixels to coordinates on axis range
    #the portion from the whole
    x_user = click.px/click.image_width
    y_user = click.py/click.image_height

    #the total range for x and y according to the user's axis range
    x_range = axis_range.x_max - axis_range.x_min
    y_range = axis_range.y_max - axis_range.y_min

    #the normalized point
    x = axis_range.x_min + x_user * x_range
    y = axis_range.y_max - y_user * y_range  #because pixels "grow" top to bottom

    #distance
    distance = math.sqrt(x * x + y * y)
    angle_rad = math.atan2(y, x)
    angle_deg = math.degrees(angle_rad)

    return DistanceAngle(
        x = x,
        y = y,
        distance = distance,
        angle_degrees = angle_deg
    )