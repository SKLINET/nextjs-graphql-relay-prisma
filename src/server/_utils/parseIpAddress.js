export const parseIpAddress = ipAddress => {
    const localAddresses = ['::ffff:127.0.0.1', '::1'];
    if (ipAddress && localAddresses.indexOf(ipAddress) === -1) {
        return ipAddress.split(',')[0];
    }

    return null;
};
