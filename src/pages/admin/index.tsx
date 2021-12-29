import {useSession} from "next-auth/react";
import {AdminLayout} from "../../components/admin/layout";
import {Box, Typography} from "@mui/material";
import {getAdminServerSideProps} from "../../constants/serverUtil";

export default function dashboard() {
    const {data: session} = useSession();

    if (!session) return null;

    return (
        <AdminLayout>
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Hi, Welcome back</Typography>
            </Box>
        </AdminLayout>
    )
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context);
}
