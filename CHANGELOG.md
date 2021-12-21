# 0.4.0
## migration steps from 0.3.x to 0.4.x
### refactored lib paths
The path `app/lib` has been moved to `app/assets/lib`.

So there can now be stored `.js` files as well as `.css` files of included libraries.

The old path is no longer valid and will lead to errors, so move your libraries to the new path and rerun `sipa i`.

### refactored structure of `sipa.json`

Only ignored indexer files are not backward compatible and may need to be ignored once again when running `sipa i`