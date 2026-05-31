I will add a fireworks animation effect that plays when the game opens.

The implementation plan is as follows:

1.  **Create `fireworks.js`**
    -   Implement a lightweight fireworks animation engine using HTML5 Canvas.
    -   It will include particle physics (gravity, friction) and explosion effects.
    -   The animation will run for a few seconds upon page load to welcome the player.

2.  **Modify `index.html`**
    -   Add a `<canvas>` element to serve as the container for the fireworks.
    -   Reference the new `fireworks.js` script.

3.  **Modify `style.css`**
    -   Set the canvas to full-screen coverage (`position: fixed`).
    -   Set `pointer-events: none` to ensure the animation doesn't block game interaction.
    -   Set a high `z-index` to make sure the fireworks appear on top of the game interface.

4.  **Integration**
    -   Initialize the fireworks effect automatically when the page loads.

This approach keeps the new effect modular and doesn't interfere with the existing game logic.
