I will fix the issue where the failure animation and the welcome fireworks do not disappear upon restarting the game, and adjust the layer order to ensure the game controls are accessible.

The implementation plan is as follows:

1.  **Modify `game.js`**
    *   In the `initializeGame` method, add a call to `this.failureEffect.stop()` to ensure the failure animation is cleared when the game restarts.

2.  **Modify `failure.js`**
    *   Change the `z-index` of the failure canvas from `2000` to `900`. This ensures it appears *below* the Game Over modal (which is `1000`), preventing it from visually blocking the buttons.

3.  **Modify `style.css`**
    *   Change the `z-index` of `#fireworksCanvas` from `9999` to `50`. This places the welcome fireworks in the background, behind the game board and UI controls.

4.  **Modify `fireworks.js`**
    *   Add a `stop()` method to clear the canvas and stop the animation loop.
    *   Add a global click listener to stop the fireworks immediately upon user interaction, ensuring they don't interfere with gameplay.

This comprehensive fix addresses both the persistence of the failure effect and the layering/dismissal of the welcome fireworks.
