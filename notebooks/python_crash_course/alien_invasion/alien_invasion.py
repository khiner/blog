import pygame
from pygame.sprite import Group

import game_functions as gf
from settings import Settings
from game_stats import GameStats
from scoreboard import Scoreboard
from button import Button
from ship import Ship
from alien import Alien
from bullet import Bullet

def run_game():
    pygame.init()
    settings = Settings()
    stats = GameStats(settings)
    screen = pygame.display.set_mode(
        (settings.screen_width, settings.screen_height))
    pygame.display.set_caption('Alien Invasion')

    sb = Scoreboard(screen, settings, stats)
    play_button = Button('Play', screen, settings)

    ship = Ship(screen, settings)
    alien = Alien(screen, settings)
    bullets = Group()
    aliens = Group()

    gf.create_fleet(ship, aliens, screen, settings)

    while True:
        gf.check_events(aliens, ship, bullets, sb, play_button, screen, settings, stats)

        if stats.game_active:
            ship.update()
            gf.update_bullets(bullets, ship, aliens, sb, screen, settings, stats)
            gf.update_aliens(aliens, ship, bullets, sb, screen, settings, stats)

        gf.update_screen(ship, aliens, bullets, screen, play_button, sb, settings, stats)

run_game()
