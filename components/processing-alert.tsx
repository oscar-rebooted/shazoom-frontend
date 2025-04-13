import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock } from "lucide-react"

interface ProcessingAlertProps {
    elapsedTime: number;
    isVisible: boolean;
}

const ProcessingAlert = ({
    elapsedTime,
    isVisible
}: ProcessingAlertProps) => {
    if (!isVisible) return null;

    return (
        <Alert className="mt-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700">Processing time: {elapsedTime} seconds</span>
            </div>
            <AlertDescription className="text-amber-600">
                Song identification can take up to 30 seconds depending on the audio quality and length.
            </AlertDescription>
        </Alert>
    );
};

export default ProcessingAlert;