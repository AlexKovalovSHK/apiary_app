import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { type HiveBox, type HiveFrame } from '../../db/db';

// Define locally since it's a UI composition
interface HiveBoxWithFrames extends HiveBox {
    frames: HiveFrame[];
}

interface HiveVisualizerProps {
    boxes: HiveBoxWithFrames[];
    onFrameClick?: (boxId: string, frameId: string) => void;
    readonly?: boolean;
}

export const HiveVisualizer: React.FC<HiveVisualizerProps> = ({ boxes, onFrameClick, readonly = false }) => {
    const { t } = useTranslation();

    const getFrameColor = (content: HiveFrame['content']) => {
        switch (content) {
            case 'honey': return '#fbbf24'; // Amber 400
            case 'brood': return '#92400e'; // Amber 800
            case 'foundation': return '#e2e8f0'; // Slate 200
            case 'empty': return '#ffffff'; // White
            default: return '#ffffff';
        }
    };

    // Render boxes from bottom (index 0) to top, so we reverse for display stack
    const displayBoxes = [...boxes].reverse();

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={1} mt={2} width="100%">
            {displayBoxes.length === 0 && (
                <Typography variant="body2" color="text.secondary">No boxes configured.</Typography>
            )}

            {displayBoxes.map((box) => (
                <Paper
                    key={box.id}
                    elevation={3}
                    sx={{
                        p: 1,
                        width: '100%',
                        maxWidth: 600,
                        backgroundColor: box.type === 'deep' ? '#f8fafc' : '#fffbeb', // Slight visual diff
                        border: '2px solid #cbd5e1',
                        position: 'relative'
                    }}
                >
                    <Box
                        className="hive-box d-flex flex-column-reverse"
                        sx={{
                            border: '4px solid #8d6e63',
                            borderBottom: 'none',
                            bgcolor: '#fff3e0',
                            position: 'relative',
                            width: '100%',
                            maxWidth: '100%', // Ensure it fits container
                            p: 1
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                position: 'absolute',
                                left: -24,
                                top: '50%',
                                transform: 'translateY(-50%) rotate(-90deg)',
                                fontWeight: 'bold',
                                color: '#5d4037',
                                display: { xs: 'none', sm: 'block' } // Hide on very small screens if needed
                            }}
                        >
                            {box.type.toUpperCase()} ({box.frames.length}/{box.capacity || 10})
                        </Typography>

                        <Box
                            display="flex"
                            height={box.type === 'deep' ? 120 : 80}
                            alignItems="flex-end"
                            justifyContent="space-between"
                            px={0.5} // Reduce padding for mobile
                        >
                            {Array.from({ length: box.capacity || 10 }).map((_, index) => {
                                const frame = box.frames.find(f => f.position === index);

                                return (
                                    <Tooltip key={index} title={frame ? t(`hives.frameContent.${frame.content}`) + ` (Pos: ${index})` : `Empty Slot ${index}`} arrow>
                                        <Box
                                            onClick={() => {
                                                if (frame) {
                                                    onFrameClick?.(box.id, frame.id);
                                                } else if (!readonly) {
                                                    onFrameClick?.(box.id, `slot:${index}`);
                                                }
                                            }}
                                            sx={{
                                                flex: 1,          // Flexible width
                                                minWidth: 0,      // Allow shrinking
                                                width: '100%',    // Fill flex container
                                                height: '100%',
                                                mx: 0.2,          // Smaller margins
                                                bgcolor: frame ? getFrameColor(frame.content) : 'transparent',
                                                border: '1px solid',
                                                borderColor: frame ? '#5d4037' : '#d7ccc8',
                                                borderStyle: frame ? 'solid' : 'dashed',
                                                cursor: readonly ? 'default' : 'pointer',
                                                borderRadius: '2px 2px 0 0',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    opacity: 0.9,
                                                    bgcolor: frame ? undefined : '#efebe9'
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                );
                            })}
                        </Box>
                    </Box>
                </Paper>
            ))}

            {/* Hive Stand Base */}
            <Box sx={{ width: '80%', maxWidth: 500, height: 10, bgcolor: '#475569', borderRadius: 1 }} />
            <Box sx={{ display: 'flex', gap: 10 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#475569' }} />
                <Box sx={{ width: 20, height: 20, bgcolor: '#475569' }} />
            </Box>
        </Box>
    );
};
