import React, { useEffect } from "react";

export function MyFinished() {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = "https://app.prolific.com/submissions/complete?cc=CTQ8U2ML";
        }, 5000);

        return () => clearTimeout(timer); // Cleanup timer if component unmounts
    }, []);

    return (
        <div className="min-h-screen bg-opacity-50 flex flex-col items-center justify-center">
            <div className="w-full max-w-xl p-5 bg-white rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Thank You!</h1>
                    <p className="mt-2 text-gray-600">
                        You have finished our study! Redirecting you to Prolific...
                    </p>
                </div>
            </div>
        </div>
    );
}