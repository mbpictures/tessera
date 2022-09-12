import { ShippingFactory, ShippingType } from "../../../../src/store/factories/shipping/ShippingFactory";
import { faker } from '@faker-js/faker';
import countryData from "country-region-data";

describe("Shipping Factories", () => {
    it("Factories available", () => {
        Object.values(ShippingType).forEach((type) => {
            expect(ShippingFactory.getShippingInstance({
                type: type,
                data: null
            })).to.not.equal(null);
        });

        expect(ShippingFactory.getShippingInstance({
            data: null,
            type: "abc"
        })).to.equal(null);
        expect(ShippingFactory.getShippingInstance(null)).to.equal(null);
    })

    it("Post", () => {
        const post = ShippingFactory.getShippingInstance({
            type: ShippingType.Post,
            data: null
        });
        post.shippingData = null;
        expect(post.isValid()).to.equal(true);
        post.data = null;
        expect(post.isValid()).to.equal(false)
        post.data = {
            differentAddress: false
        };
        expect(post.isValid()).to.equal(true);
        post.data = {
            differentAddress: true
        };
        expect(post.isValid()).to.equal(false);
        post.data = {
            differentAddress: true,
            address: {
                firstName: "",
                lastName: "",
                address: faker.address.streetAddress()
            }
        };
        expect(post.isValid()).to.equal(false);
        const country1 = countryData.find(country => country.regions.length === 0);
        if (country1) {
            post.data = {
                differentAddress: true,
                address: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    address: faker.address.streetAddress(),
                    zip: faker.address.zipCode("#####"),
                    city: faker.address.city(),
                    country: country1,
                    region: null
                }
            };
            expect(post.isValid()).to.equal(true);
        }
        const country2 = countryData.find(country => country.regions.length >= 0);
        post.data = {
            differentAddress: true,
            address: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                address: faker.address.streetAddress(),
                zip: faker.address.zipCode("#####"),
                city: faker.address.city(),
                country: country2,
                region: country2.regions[0]
            }
        };
        expect(post.isValid()).to.equal(true);
        expect(post.DisplayName).to.equal("postal-delivery");
    })

    it("Download", () => {
        const download = ShippingFactory.getShippingInstance({
            type: ShippingType.Download,
            data: null
        });
        expect(download.isValid()).to.equal(true);
        expect(download.DisplayName).to.equal("download");
    })

    it("Box Office", () => {
        const boxoffice = ShippingFactory.getShippingInstance({
            type: ShippingType.BoxOffice,
            data: null
        });
        expect(boxoffice.isValid()).to.equal(true);
        expect(boxoffice.DisplayName).to.equal("box-office");
    })
})
