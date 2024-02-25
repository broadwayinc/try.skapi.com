import { Skapi } from 'skapi-js';
import Service from './service';
import Countries from './countries';

export const skapi = new Skapi(import.meta.env.VITE_ADMIN, 'skapi', { autoLogin: window.localStorage.getItem('remember') === 'true' }, JSON.parse(import.meta.env.VITE_ETC));

const regions = JSON.parse(import.meta.env.VITE_REG);

const getAdminEndpoint = async (dest: string, auth: boolean = true) => {
    const endpoints = await Promise.all([
        skapi.admin_endpoint,
        skapi.record_endpoint
    ]);

    const admin = endpoints[0];
    const record = endpoints[1];
    const get_ep = () => {
        switch (dest) {
            case 'delete-newsletter':
            case 'block-account':
            case 'register-service':
            case 'get-services':
            case 'register-subdomain':
            case 'list-host-directory':
            case 'refresh-cdn':
            case 'request-newsletter-sender':
            case 'set-404':
            case 'subdomain-info':
            case 'service-opt':
                return {
                    public: admin.admin_public,
                    private: admin.admin_private
                };

            case 'storage-info':
                return {
                    private: record.record_private,
                    public: record.record_public
                };

            default:
                return null
        }
    };

    return (get_ep()?.[auth ? 'private' : 'public'] || '') + dest;
}

export async function createService(
    params: {
        name: string;
        cors: string[];
        api_key: string;
    }
): Promise<Service> {
    let currentLocale = skapi.connection.locale;
    let serviceRegion = '';

    if (regions?.[currentLocale]) {
        serviceRegion = regions[currentLocale];
    }
    else {
        const calculateDistance = (locale: any, region: any) => {
            const R = 6371e3; // metres
            const φ1 = (locale.latitude * Math.PI) / 180; // φ, λ in radians
            const φ2 = (region.latitude * Math.PI) / 180;
            const Δφ = ((region.latitude - locale.latitude) * Math.PI) / 180;
            const Δλ = ((region.longitude - locale.longitude) * Math.PI) / 180;

            const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const d = R * c; // in metres

            return d;
        };

        let difference = null;
        for (let region in regions) {
            let distance = calculateDistance(Countries[currentLocale], Countries[region]);
            if (difference == null || distance < difference) {
                difference = distance;
                serviceRegion = regions[region];
            }
        }
    }

    let service = await skapi.request(await getAdminEndpoint('register-service'), Object.assign(params, { execute: 'create', region: serviceRegion }), { auth: true });
    return Service.load(service.service);
}
