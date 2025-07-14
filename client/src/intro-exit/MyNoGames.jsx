import React from "react";

export function MyNoGames() {
    return (
        <div className="min-h-screen bg-opacity-50 flex flex-col items-center justify-center">
            <div className="w-full max-w-xl p-5 bg-white rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">No games currently available.</h1>
                    <p className="mt-4 text-gray-600">
                        Please wait a minute or so and refresh. If there is still no game, please contact us on prolific.
                    </p>
                </div>
            </div>
        </div>
    );
} 