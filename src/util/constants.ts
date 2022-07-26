const defaultAgeConfig = {
    versionText: "age-encryption.org/v1", // the AGE version this conforms too
    headerMacMessage: "header", // message used for the HKDF in the header mac
    bodyMacMessage: "payload", // message used for the HKDF in the body mac
}
export {defaultAgeConfig}