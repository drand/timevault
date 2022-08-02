import {Beacon, DrandClient} from "../../src/drand/drand-client"

class MockDrandClient implements DrandClient {

    constructor(private beacon: Beacon) {
    }

    get(_: number): Promise<Beacon> {
        return Promise.resolve(this.beacon)
    }
}

export { MockDrandClient }
