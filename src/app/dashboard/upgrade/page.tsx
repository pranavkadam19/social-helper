"use client";
import * as React from "react";
import Script from "next/script";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you're using sonner for notifications

const Upgrade = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleOnClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/upgrade/checkout");
      const { key, orderId, amount, currency, email, name } = response.data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Social Helper",
        description: "10,000 AI Credits Purchase",
        order_id: orderId,
        prefill: {
          name: name,
          email: email,
        },
        handler: async function (response: any) {
          try {
            // You might want to verify the payment on server side
            // await axios.post("/api/upgrade/verify", response);
            toast.success("Payment successful!");
            router.push("/dashboard");
          } catch (error) {
            toast.error("Error verifying payment");
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Failed to initiate payment");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="mx-5 py-2">
        <div className="mt-5 py-6 px-4 bg-white rounded">
          <h2 className="font-medium">Upgrade Credit</h2>
        </div>
        <div className="mt-5 py-6 px-4 rounded">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>&#x20b9; 800 One-Time Purchase</CardTitle>
              <CardDescription>10,000 AI Credit</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <p className="flex my-2 gap-2">
                  <Check /> 10,000 words/purchase
                </p>
                <p className="flex my-2 gap-2">
                  <Check /> All Template Access
                </p>
                <p className="flex my-2 gap-2">
                  <Check /> Retain All History
                </p>
              </div>
              <Button
                className="mt-5 w-full"
                onClick={handleOnClick}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Purchase"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
