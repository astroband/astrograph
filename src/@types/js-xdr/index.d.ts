declare module "js-xdr";

// declare module "js-xdr" {
//   import * as Buffer from "buffer";
//   type XdrFormat = "raw" | "hex" | "base64";
//
//   export class Cursor {
//     constructor(buffer: Buffer);
//     _setBuffer(buffer: Buffer): void;
//     _buffer: Buffer;
//     _index: number;
//     length: number;
//     buffer(): Buffer;
//     tap(cb: (self: Cursor) => void): Cursor;
//     clone(newIndex: number, ...args: any[]): any;
//     copyFrom(source: Buffer | Cursor): Cursor;
//     seek(op?: "+" | "-" | "=", index: number): Cursor;
//     tell(): number;
//     rewind(): Cursor;
//     eof(): boolean;
//     fill(value: any, length: any, ...args: any[]): Cursor;
//     slice(length?: number): Cursor;
//     concat(list: Cursor[]): Cursor;
//     toString(encoding: BufferEncoding, length: number, ...args: any[]): any;
//     write(string: string, length: number, encoding: any): Cursor;
//     writeBufferPadded(buffer: Buffer): Cursor;
//   }
//
//
//   export class Array {
//     constructor(childType: any, length: any);
//     _childType: any;
//     _length: any;
//     read(io: any): any;
//     write(value: any, io: any): void;
//     isValid(value: any): any;
//   }
//
//
//   export namespace Int {
//     const MAX_VALUE: number;
//     const MIN_VALUE: number;
//   }
//
//
//   export namespace Bool {
//     function read(io: any): boolean;
//     function read(io: any): boolean;
//     function write(value: any, io: any): void;
//     function write(value: any, io: any): void;
//     function isValid(value: any): any;
//     function isValid(value: any): any;
//   }
//
//
//   export class Hyper {
//     static read(io: any): Hyper;
//     static write(value: any, io: any): void;
//     static fromString(string: any): Hyper;
//     static fromBits(low: any, high: any): Hyper;
//     static isValid(value: any): boolean;
//     constructor(low: any, high: any);
//   }
//   export namespace Hyper {
//     const MAX_VALUE: Hyper;
//     const MIN_VALUE: Hyper;
//   }
//
//
//   export namespace UnsignedInt {
//     const MAX_VALUE: number;
//     const MIN_VALUE: number;
//   }
//
//
//   export class UnsignedHyper {
//     static read(io: any): UnsignedHyper;
//     static write(value: any, io: any): void;
//     static fromString(string: any): UnsignedHyper;
//     static fromBits(low: any, high: any): UnsignedHyper;
//     static isValid(value: any): boolean;
//     constructor(low: any, high: any);
//   }
//   export namespace UnsignedHyper {
//     const MAX_VALUE: UnsignedHyper;
//     const MIN_VALUE: UnsignedHyper;
//   }
//
//
//   export namespace Float {
//     function read(io: any): any;
//     function read(io: any): any;
//     function write(value: any, io: any): void;
//     function write(value: any, io: any): void;
//     function isValid(value: any): any;
//     function isValid(value: any): any;
//   }
//
//
//   export namespace Double {
//     function read(io: any): any;
//     function write(value: any, io: any): void;
//     function isValid(value: any): any;
//   }
//
//   export class String {
//     constructor(maxLength?: any);
//     _maxLength: any;
//     read(io: any): any;
//     readString(io: any): any;
//     write(value: any, io: any): void;
//     isValid(value: any): boolean;
//   }
//
//
//   export class Opaque {
//     constructor(length: any);
//     static read(io: any): Opaque;
//     static write(value: Opaque, io: any): void;
//     isValid(value: any): boolean;
//   }
//
//   export class VarOpaque {
//     static toXDR(val: VarOpaque): Buffer;
//     static fromXDR(input, format: XdrFormat): VarOpaque;
//     constructor(maxLength?: number);
//     read(io: any): void;
//     write(value: any, io: any): void;
//     isValid(value: any): boolean;
//     toXDR(format: XdrFormat)
//   }
//
//
//   export class VarArray {
//     constructor(childType: any, maxLength?: any);
//     _childType: any;
//     _maxLength: any;
//     read(io: any): any;
//     write(value: any, io: any): void;
//     isValid(value: any): any;
//   }
//
//
//   export class Option {
//     constructor(childType: any);
//     _childType: any;
//     read(io: any): any;
//     write(value: any, io: any): void;
//     isValid(value: any): any;
//   }
//
//
//   export class Void {
//     read(): any;
//     write(value: any): void;
//     isValid(value: any): any;
//   }
//
//   export class Enum {
//     static read(io: any): any;
//     static write(value: any, io: any): void;
//     static isValid(value: any): boolean;
//     static members(): any;
//     static values(): any;
//     static fromName(name: any): any;
//     static fromValue(value: any): any;
//     static create(context: any, name: any, members: any): {
//       new (name: any, value: any): {
//         name: any;
//         value: any;
//       };
//       enumName: any;
//       _members: {};
//       _byValue: Map<any, any>;
//       read(io: any): any;
//       write(value: any, io: any): void;
//       isValid(value: any): boolean;
//       members(): any;
//       values(): any;
//       fromName(name: any): any;
//       fromValue(value: any): any;
//       create(context: any, name: any, members: any): any;
//     };
//     constructor(name: any, value: any);
//     name: any;
//     value: any;
//   }
//
//   export class Struct {
//     static read(io: any): Struct;
//     static write(value: any, io: any): void;
//     static isValid(value: any): boolean;
//     static create(context: any, name: any, fields: any): {
//       new (attributes: any): {
//         _attributes: any;
//       };
//       structName: any;
//       _fields: any;
//       read(io: any): Struct;
//       write(value: any, io: any): void;
//       isValid(value: any): boolean;
//       create(context: any, name: any, fields: any): any;
//     };
//     constructor(attributes: any);
//     _attributes: any;
//   }
//
//
//   export class Union {
//     static armForSwitch(aSwitch: any): any;
//     static armTypeForArm(arm: any): any;
//     static read(io: any): Union;
//     static write(value: any, io: any): void;
//     static isValid(value: any): boolean;
//     static create(context: any, name: any, config: any): {
//       new (aSwitch: any, value: any): {
//         set(aSwitch: any, value: any): void;
//         _switch: any;
//         _arm: any;
//         _armType: any;
//         _value: any;
//         get(armName?: any): any;
//         switch(): any;
//         arm(): any;
//         armType(): any;
//         value(): any;
//       };
//       unionName: any;
//       _switchOn: any;
//       _switches: Map<any, any>;
//       _arms: {};
//       _defaultArm: any;
//       armForSwitch(aSwitch: any): any;
//       armTypeForArm(arm: any): any;
//       read(io: any): Union;
//       write(value: any, io: any): void;
//       isValid(value: any): boolean;
//       create(context: any, name: any, config: any): any;
//     };
//     constructor(aSwitch: any, value: any);
//     set(aSwitch: any, value: any): void;
//     _switch: any;
//     _arm: any;
//     _armType: any;
//     _value: any;
//     get(armName?: any): any;
//     switch(): any;
//     arm(): any;
//     armType(): any;
//     value(): any;
//   }
// }
