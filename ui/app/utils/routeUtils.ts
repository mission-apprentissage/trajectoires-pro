import { NextResponse } from "next/server";
import { ErrorFetchingJson } from "./fetch";
import { ValidationError } from "yup";

export async function tryCatch(fn: Function) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ErrorFetchingJson) {
      return NextResponse.json(err.data, { status: err.status });
    } else if (err instanceof ValidationError) {
      return NextResponse.json(err, { status: 400 });
    } else {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
