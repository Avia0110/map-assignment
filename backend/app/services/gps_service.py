# app/services/gps_service.py

from app.models.schemas import Mode2Calibration, Mode2Click, Mode2ClickResult


def compute_gps_from_click(click: Mode2Click, calib: Mode2Calibration) -> Mode2ClickResult:
    #convert a pixel click on the image to GPS coordinates

    #differences in pixel space between the two calibration points
    dx_px = calib.p2_px - calib.p1_px
    dy_px = calib.p2_py - calib.p1_py

    #avoid division by zero (degenerate calibration)
    if dx_px == 0:
        t_x = 0.0
    else:
        t_x = (click.px - calib.p1_px) / dx_px

    if dy_px == 0:
        t_y = 0.0
    else:
        t_y = (click.py - calib.p1_py) / dy_px

    #interpolate longitude (x direction)
    lon = calib.p1_lon + t_x * (calib.p2_lon - calib.p1_lon)

    # Interpolate latitude (y direction)
    # Note: image y grows downward; real latitude usually grows "upward" (north).
    # For this assignment we keep it simple and use the same direction.
    lat = calib.p1_lat + t_y * (calib.p2_lat - calib.p1_lat)

    return Mode2ClickResult(lat=lat, lon=lon)
