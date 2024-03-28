import { expect } from '@jest/globals';
import { acquireData } from './index';

describe('acquireData', () => {
  it('should ignore the headers', () => {
    const input = `name, country, phone
                  John Doe, India, 1234567890`;

    const expected = [{ city: 'John Doe', phone: '1234567890' }];
    expect(acquireData(input)).toEqual(expected);
  });

  it('should ignore empty lines', () => {
    const input = `name, country, phone

                  John Doe, India, 1234567890`;

    const expected = [{ city: 'John Doe', phone: '1234567890' }];
    expect(acquireData(input)).toEqual(expected);
  });

  it('should ignore records with countries other than India', () => {
    const input = `name, country, phone
                  John Doe, USA, 1234567890
                  Jane Doe, India, 9876543210`;

    const expected = [{ city: 'Jane Doe', phone: '9876543210' }];
    expect(acquireData(input)).toEqual(expected);
  });

  it('should return all records with country India', () => {
    const input = `name, country, phone
                  John Doe, India, 1234567890
                  Jane Doe, India, 9876543210
                  Kaio Silveira, Portugal, 913111222333`;

    const expected = [
      { city: 'John Doe', phone: '1234567890' },
      { city: 'Jane Doe', phone: '9876543210' },
    ];

    expect(acquireData(input)).toEqual(expected);
  });
});
