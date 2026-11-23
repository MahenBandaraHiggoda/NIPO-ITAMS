package lk.nipo.itams.assets.exception;

public class DuplicateAssetException extends RuntimeException {
    public DuplicateAssetException() { super("Asset code or serial number is already in use"); }
}
