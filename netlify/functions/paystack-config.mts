import { handlePaystack } from "./paystack.mts";

export default async (request: Request) => handlePaystack(request, "config");
