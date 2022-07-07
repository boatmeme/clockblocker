import { Clock } from '../src/index'

test('exists', () => {
 const clock = new Clock
 expect(clock).toBeInstanceOf(Clock)
})