import { describe, it, expect } from "vitest";
import { validate, ValidationError, z } from "../src";

describe("validate()", () => {
    it("should return parsed data for valid input", () => {
        const schema = z.object({
            name: z.string(),
            age: z.number(),
        });

        const result = validate(schema, {
            name: "Sumedh",
            age: 24,
        });

        expect(result).toEqual({
            name: "Sumedh",
            age: 24,
        });
    });

    it("should throw validation Error if not a valid input",()=>{
        const schema = z.object({
            name: z.string(),
            age: z.number()
        })

        expect(() => validate(schema,{
            name: "Sumedhav",
            age: "25"
        })).toThrow(ValidationError)
    })

    it("should include validation issues",()=> {
        const schema = z.object({
            age: z.number()
        })
        try{
            validate(schema, {
                age: "25"
            })

            throw new Error("Expected validation to fail")
        }catch(err){
            expect(err).toBeInstanceOf(ValidationError)

            if(err instanceof ValidationError){
                expect(err.issues).toHaveLength(1)
                expect(err.issues[0].path).toEqual(["age"])
            }
        }
    })
});