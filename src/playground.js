
const options = {level: SipaState.LEVEL.SESSION};
let key = 'spec3';
let value = 345;
SipaState.setSession(key, value);
SipaState.get(key).toEqual(value);
SipaState.getLevel(key).toEqual(SipaState.LEVEL.SESSION);