import { STEP_URLS } from "../../../../src/constants/Constants";
import { NextAvailableFactory } from "../../../../src/store/factories/nextAvailable/NextAvailableFactory";

describe("Next Available Factories", () => {
    it("Factories available", () => {
        STEP_URLS
            .filter((_, index) => index < STEP_URLS.length - 1)
            .forEach(url => {
                expect(NextAvailableFactory.getInstance(url, null))
                    .to.not.equal(null);
            });

        expect(NextAvailableFactory.getInstance(STEP_URLS[STEP_URLS.length - 1], null)).to.equal(null);
        expect(NextAvailableFactory.getInstance("this-page-does-not-exist", null)).to.equal(null);
    })
})
