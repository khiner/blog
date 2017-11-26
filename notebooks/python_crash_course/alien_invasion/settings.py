class Settings():
    """Stores all settings for Alien Invasion."""

    def __init__(self):
        """Initialize the game's settings."""
        self.screen_width = 1200
        self.screen_height = 800
        self.bg_color = (100, 100, 240)
        self.ship_speed = 10.0
        self.ship_limit = 3
        self.bullet_speed = 10.0
        self.bullet_width = 300
        self.bullet_height = 15
        self.bullet_color = 60, 60, 60
        self.bullets_allowed = 30
        self.fleet_speed = 10.0
        self.fleet_drop_speed = 100.0
        # fleet_direction of 1 respresents right; -1 represents left.
        self.fleet_direction = 1

        # For testing:
        self.super_bullets = True
