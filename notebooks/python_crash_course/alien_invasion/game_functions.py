import sys
from time import sleep

import pygame

from bullet import Bullet
from alien import Alien

def check_keydown_events(event, aliens, ship, bullets, screen, settings, stats):
    if event.key == pygame.K_RIGHT:
        ship.move_right()
    if event.key == pygame.K_LEFT:
        ship.move_left()
    elif event.key == pygame.K_SPACE:
        fire_bullet(bullets, ship, screen, settings)
    elif event.key == pygame.K_q:
        sys.exit()
    elif event.key == pygame.K_p:
        start_game(aliens, ship, bullets, screen, settings, stats)

def check_keyup_events(event, ship):
    if event.key == pygame.K_RIGHT:
        ship.stop_moving_right()
    elif event.key == pygame.K_LEFT:
        ship.stop_moving_left()

def check_events(aliens, ship, bullets, screen, play_button, settings, stats):
    """Respond to keypresses and mouse events."""
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()
        elif event.type == pygame.KEYDOWN:
            check_keydown_events(event, aliens, ship, bullets, screen, settings, stats)
        elif event.type == pygame.KEYUP:
            check_keyup_events(event, ship)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mouse_x, mouse_y = pygame.mouse.get_pos()
            check_play_button(mouse_x, mouse_y, aliens, ship, bullets, screen, play_button, settings, stats)

def check_play_button(mouse_x, mouse_y, aliens, ship, bullets, screen, play_button, settings, stats):
    """Start a new game when the player clicks Play."""
    button_clicked = play_button.rect.collidepoint(mouse_x, mouse_y)
    if button_clicked:
        start_game(aliens, ship, bullets, screen, settings, stats)

def start_game(aliens, ship, bullets, screen, settings, stats):
    """Starts the game if not already in play."""
    if not stats.game_active:
        pygame.mouse.set_visible(False)
        stats.reset_stats(settings)
        reset_game(aliens, ship, bullets, screen, settings)
        stats.game_active = True

def update_screen(ship, aliens, bullets, screen, play_button, settings, stats):
    """Update images on the screen and redraw."""
    screen.fill(settings.bg_color)

    for bullet in bullets.sprites():
        bullet.draw()

    ship.draw()
    aliens.draw(screen)

    if not stats.game_active:
        play_button.draw()

    # Make the most recently drawn screen visible.
    pygame.display.flip()

def fire_bullet(bullets, ship, screen, settings):
    """Fire a bullet if limit not reached yet."""
    if len(bullets) < settings.bullets_allowed:
        new_bullet = Bullet(screen, settings, ship)
        bullets.add(new_bullet)

def delete_stale_bullets(bullets):
    for bullet in bullets.copy():
        if bullet.rect.bottom <= 0:
            bullets.remove(bullet)

def update_bullets(bullets, ship, aliens, screen, settings):
    """Update position of bullets and get rid of old bullets."""
    bullets.update()
    delete_stale_bullets(bullets)

    check_bullet_alien_collisions(bullets, ship, aliens, screen, settings)

def check_bullet_alien_collisions(bullets, ship, aliens, screen, settings):
    """Respond to bullet-alien collisions."""
    collisions = pygame.sprite.groupcollide(bullets, aliens, not settings.super_bullets, True)

    if len(aliens) == 0:
        bullets.empty()
        create_fleet(ship, aliens, screen, settings)

def update_aliens(aliens, ship, bullets, screen, settings, stats):
    """
    Check if the fleet is at an edge,
     and then update the positions of all aliens in the fleet.
    """
    if check_fleet_edges(aliens, settings):
        change_fleet_direction(aliens, settings)
    aliens.update()

    # Look for alien-ship collisions.
    if pygame.sprite.spritecollideany(ship, aliens):
        ship_hit(ship, aliens, bullets, screen, settings, stats)

    if check_aliens_bottom(aliens, ship, bullets, screen, settings, stats):
        # Treat this the same as if the ship got hit.
        ship_hit(ship, aliens, bullets, screen, settings, stats)

def get_number_aliens_x(alien_width, settings):
    """Determine the number of aliens that fit in a row."""
    available_space_x = settings.screen_width - 2 * alien_width
    return int(available_space_x / (2 * alien_width))

def get_number_rows(ship_height, alien_height, settings):
    """Determine the number of rows of aliens that fit on the screen."""
    available_space_y = settings.screen_height - 3 * alien_height - ship_height
    return int(available_space_y / (2 * alien_height))

def create_alien(aliens, alien_number, row_number, screen, settings):
    """Create an alien and place it in the row."""
    alien = Alien(screen, settings)
    alien.set_x(alien.width() + 2 * alien.width() * alien_number)
    alien.set_y(alien.height() + 2 * alien.height() * row_number)
    aliens.add(alien)

def create_fleet(ship, aliens, screen, settings):
    """Create a full fleet of aliens."""
    # Spacing between each alien is one alien width.
    alien = Alien(screen, settings)

    for row_number in range(get_number_rows(ship.height(), alien.height(), settings)):
        for alien_number in range(get_number_aliens_x(alien.width(), settings)):
            create_alien(aliens, alien_number, row_number, screen, settings)

def check_fleet_edges(aliens, settings):
    """Returns True if any aliens have reached an adge."""
    for alien in aliens.sprites():
        if alien.check_edges():
            return True
    return False

def check_aliens_bottom(aliens, ship, bullets, screen, settings, stats):
    """Returns True if any aliens have reached the bottom of the screen."""
    screen_rect = screen.get_rect()
    for alien in aliens.sprites():
        if alien.rect.bottom >= screen_rect.bottom:
            return True
    return False

def change_fleet_direction(aliens, settings):
    """Drop the entire fleet and change the fleet's direction."""
    for alien in aliens.sprites():
        alien.set_y(alien.y + settings.fleet_drop_speed)
    settings.fleet_direction *= -1

def reset_game(aliens, ship, bullets, screen, settings):
    aliens.empty()
    bullets.empty()

    create_fleet(ship, aliens, screen, settings)
    ship.center()

def ship_hit(ship, aliens, bullets, screen, settings, stats):
    """Respond to ship being hit by alien."""
    if stats.ships_left > 0:
        stats.ships_left -= 1
        reset_game(aliens, ship, bullets, screen, settings)
        sleep(0.5)
    else:
        stats.game_active = False
        pygame.mouse.set_visible(True)