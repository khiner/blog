import sys

import pygame

from bullet import Bullet

def check_keydown_events(event, screen, settings, ship, bullets):
    if event.key == pygame.K_RIGHT:
        ship.move_right()
    if event.key == pygame.K_LEFT:
        ship.move_left()
    elif event.key == pygame.K_SPACE:
        fire_bullet(screen, settings, ship, bullets)
    elif event.key == pygame.K_q:
        sys.exit()

def check_keyup_events(event, ship):
    if event.key == pygame.K_RIGHT:
        ship.stop_moving_right()
    elif event.key == pygame.K_LEFT:
        ship.stop_moving_left()

def check_events(screen, settings, ship, bullets):
    """Respond to keypresses and mouse events."""
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()
        elif event.type == pygame.KEYDOWN:
            check_keydown_events(event, screen, settings, ship, bullets)
        elif event.type == pygame.KEYUP:
            check_keyup_events(event, ship)

def update_screen(screen, settings, ship, bullets):
    """Update images on the screen and redraw."""
    screen.fill(settings.bg_color)

    for bullet in bullets.sprites():
        bullet.draw()

    ship.draw()

    # Make the most recently drawn screen visible.
    pygame.display.flip()

def fire_bullet(screen, settings, ship, bullets):
    """Fire a bullet if limit not reached yet."""
    if len(bullets) < settings.bullets_allowed:
        new_bullet = Bullet(screen, settings, ship)
        bullets.add(new_bullet)

def delete_stale_bullets(bullets):
    for bullet in bullets.copy():
        if bullet.rect.bottom <= 0:
            bullets.remove(bullet)

def update_bullets(bullets):
    """Update position of bullets and get rid of old bullets."""
    bullets.update()
    delete_stale_bullets(bullets)
