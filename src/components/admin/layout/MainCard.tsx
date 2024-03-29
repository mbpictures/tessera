import { Avatar, Card, Grid, PaletteColor, Stack, Theme, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";

const CardWrapper = styled(Card)<{colorPalette: PaletteColor}>(({theme, colorPalette}: {theme: Theme, colorPalette: PaletteColor}) => ({
    backgroundColor: colorPalette.dark,
    color: colorPalette.contrastText,
    overflow: "hidden",
    position: "relative",
    height: "100%",
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: colorPalette.light,
        borderRadius: '50%',
        top: -85,
        right: -95,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: colorPalette.main,
        borderRadius: '50%',
        top: -125,
        right: -15,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));

export const MainCard = ({title, secondaryTitle, titleIcon, icon, color, navigations, children}: {title?: JSX.Element | string, secondaryTitle?: JSX.Element | string, titleIcon?: JSX.Element, icon?: JSX.Element, color?: PaletteColor, navigations?: Array<JSX.Element>, children?: JSX.Element}) => {
    return (
        <CardWrapper colorPalette={color} elevation={3}>
            <Stack p={2} justifyContent={"center"} display={"flex"} height={"100%"}>
                <Grid container direction="column">
                    <Grid item>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                        mt: 1
                                    }}
                                >
                                    {icon}
                                </Avatar>
                            </Grid>
                            {
                                navigations?.map((navigation, index) => (
                                    <Grid key={index} item sx={{zIndex: 1}}>
                                        {navigation}
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container alignItems="center">
                            <Grid item>
                                <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }} color={color.contrastText}>
                                    {title}
                                </Typography>
                            </Grid>
                            {
                                titleIcon && (
                                    <Grid item>
                                        <Avatar
                                            sx={{
                                                cursor: 'pointer',
                                                backgroundColor: `rgba(255, 255, 255, 0.5)`,
                                                color: color.dark
                                            }}
                                        >
                                            {titleIcon}
                                        </Avatar>
                                    </Grid>
                                )
                            }
                        </Grid>
                    </Grid>
                    <Grid item sx={{ mb: 1.25 }}>
                        <Typography
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: color[200]
                            }}
                        >
                            {secondaryTitle}
                        </Typography>
                    </Grid>
                </Grid>
                {
                    children && (
                        <Box>
                            {children}
                        </Box>
                    )
                }
            </Stack>
        </CardWrapper>
    );
}
