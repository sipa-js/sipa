# 0.4.0
## refactored lib paths
The path `app/lib` has been moved to `app/assets/lib`.

So there can now be stored `.js` files as well as `.css` files of included libraries.

The old path is no longer valid and will lead to errors, so move your libraries and rerun `spia i`.