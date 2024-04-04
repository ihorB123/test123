import { Box, styled } from "@mui/material";
import Chip from "Shared/Mui/Atoms/Chip/Chip";
import Paper from "Shared/Mui/Atoms/Paper/Paper";
import TextField from "Shared/Mui/Atoms/TextField/TextField";
import Typography from "Shared/Mui/Atoms/Typography/Typography";
import { ThemeNames } from "Shared/Types/ThemeNames";
import { getPropertiesForTheme } from "Shared/Common/Utils/mui";

export const Container = styled(Box)(({ theme }) => {
    return {
        padding: theme.spacing(20, 4, 10),

        [theme.breakpoints.down("md")]: {
            padding: theme.spacing(10, 4, 10),
        },
    };
});

export const Content = styled(Box)(({ theme }) => ({
    margin: theme.spacing(0, "auto"),

    [theme.breakpoints.up("lg")]: {
        maxWidth: 842,
    },

    [theme.breakpoints.up("xl")]: {
        maxWidth: 960,
    },
}));

export const SearchQuestionsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(6),

    [theme.breakpoints.up("lg")]: {
        marginBottom: theme.spacing(10),
    },
}));

export const SearchQuestionsField = styled(TextField)({
    width: "100%",

    "& .MuiInputBase-input": {
        minWidth: "auto",
    },
});

export const ChipsContainer = styled("div")(({ theme }) => ({
    display: "inline-flex",
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(3),
    overflow: "auto",
    height: 50,
    maxWidth: "100%",

    [theme.breakpoints.up("lg")]: {
        height: "auto",
        flexWrap: "wrap",
    },
}));

export const SearchDropdown = styled(Paper)(({ theme }) => ({
    position: "absolute",
    top: 60,
    zIndex: 2,
    width: "100%",
    background: theme.palette.general.white,
    maxHeight: 300,
    overflowY: "auto",
}));

export const DropdownItem = styled(Box)(({ theme }) => ({
    minHeight: 37,
    padding: theme.spacing(2.5, 3.75),
    cursor: "pointer",
}));

export const FaqHeading = styled(Typography)(({ theme }) => ({
    maxWidth: 300,
    margin: theme.spacing(0, "auto", 6),

    [theme.breakpoints.up("md")]: {
        maxWidth: 350,
        margin: theme.spacing(0, "auto", 10),
    },
}));

export const StyledChip = styled(Chip)(({ theme }) => {
    const themeStyles = {
        [ThemeNames.DREAMCLOUD]: {
            borderRadius: 0,
        },
        default: undefined,
    };

    const styles = getPropertiesForTheme(themeStyles, theme.name);

    return {
        "&.MuiButtonBase-root.MuiButton-root": {
            textTransform: "capitalize",
        },

        ...styles,
    };
});
