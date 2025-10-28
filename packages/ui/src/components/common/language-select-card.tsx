"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Languages, Globe, ChevronRight, ChevronDown } from "lucide-react";
import { useTranslations } from "@workspace/i18n";
import { cn } from "@workspace/ui/lib/utils";
import { LANGUAGE_KEYS } from "@workspace/ui/config/languages";
import { useLanguageStore } from "@workspace/ui/stores/language-store";

export function LanguageSelectCard() {
  const { language, translateToEnglish, setLanguage, setTranslateToEnglish } =
    useLanguageStore();
  const tLanguages = useTranslations("Languages");
  const t = useTranslations("LanguageSelectCard");
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // Popular language codes
  const popularLanguageCodes = [
    "auto",
    "en",
    "tr",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ru",
    "zh",
    "ja",
  ];

  // Build languages array from translations
  const languages = useMemo(
    () =>
      LANGUAGE_KEYS.map((lang) => ({
        value: lang.value,
        label: tLanguages(lang.key),
      })),
    [tLanguages]
  );

  // Separate popular and other languages
  const { popularLanguages, otherLanguages } = useMemo(() => {
    const popular = languages.filter((lang) =>
      popularLanguageCodes.includes(lang.value)
    );
    const others = languages.filter(
      (lang) => !popularLanguageCodes.includes(lang.value)
    );
    return { popularLanguages: popular, otherLanguages: others };
  }, [languages]);

  return (
    <Card>
      <CardHeader
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        role="button"
        tabIndex={0}
      >
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        {isCardExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </CardHeader>
      {isCardExpanded && (
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label className="flex items-center gap-2">
                <Globe className="size-4" />
                {t("audioLanguage")}
              </Label>
              <p className="text-muted-foreground text-xs">
                {t("audioLanguageDescription")}
              </p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language-select" className="cursor-pointer">
                <SelectValue placeholder={t("selectLanguagePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("popularLanguages")}</SelectLabel>
                  {popularLanguages.map((lang) => {
                    const isSelected = language === lang.value;
                    return (
                      <SelectItem
                        key={lang.value}
                        value={lang.value}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-accent"
                        )}
                      >
                        {lang.label}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>{t("allLanguages")}</SelectLabel>
                  {otherLanguages.map((lang) => {
                    const isSelected = language === lang.value;
                    return (
                      <SelectItem
                        key={lang.value}
                        value={lang.value}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-accent"
                        )}
                      >
                        {lang.label}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Translate to English */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label className="flex items-center gap-2">
                <Languages className="size-4" />
                {t("translateToEnglish")}
              </Label>
              <p className="text-muted-foreground text-xs">
                {t("translateToEnglishDescription")}
              </p>
            </div>
            <Switch
              id="translate-toggle"
              checked={translateToEnglish}
              onCheckedChange={setTranslateToEnglish}
              className="cursor-pointer"
            />
          </div>

          {/* Selected Language Display */}
          {language && (
            <div className="p-3 rounded-lg border bg-muted/50 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("selectedLanguage")}
              </p>
              <p className="text-sm font-medium">
                {languages.find((l) => l.value === language)?.label}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
