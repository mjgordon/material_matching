class Scene{
    sceneElements: SceneElement[] = [];

    draw() {
        this.sceneElements.forEach(function(se) {
            se.draw();
          });
    }

    addElement(se:SceneElement) {
        this.sceneElements.push(se);
    }
}