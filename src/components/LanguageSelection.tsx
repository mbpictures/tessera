import { MenuItem, Select } from "@mui/material";
import { useRouter } from "next/router";
import { FlagIcon, FlagIconCode } from "react-flag-kit";
import { Box } from "@mui/system";

export const LanguageSelection = () => {
    const router = useRouter();

    const handleSwitchLocale = async (locale) => {
        await router.replace(router.asPath, router.asPath, { locale: locale })
    };

    // we don't need a language dropdown with only one language
    if ((router.locales?.length ?? 0) <= 1) return null;

    return (
        <Select value={router.locale} sx={{"> div": {padding: "0 10px"}}}>
            {
                router.locales.map((locale) => {
                    let code = locale.toUpperCase().split("-")[0];
                    code = code !== "EN" ? code : "GB";
                    return (
                        <MenuItem
                            onClick={() =>handleSwitchLocale(locale)}
                            value={locale}
                            key={locale}
                        >
                            <Box
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                {
                                    <FlagIcon
                                        code={code as FlagIconCode}
                                        style={{marginRight: "10px"}}
                                    />
                                }
                                {code}
                            </Box>
                        </MenuItem>
                    )
                })
            }
        </Select>
    )
};
