    /**
     * @namespace dff/iso/3166
     */
    dff.namespace('dff.iso.3166');

    /**
     * List of all ISO 3166 codes. Each list item holds
     * the country name, its number and abbreviations
     *
     * @name codes
     * @memberOf dff/iso/3166
     * @constant
     * @example
     * { "name": "BELIZE", "a2": "BZ", "a3": "BLZ", "number": "084" },
     */
    dff.define('dff.iso.3166.codes', [
            { "name": "AALAND ISLANDS", "a2": "AX", "a3": "ALA", "number": "248" },
            { "name": "AFGHANISTAN", "a2": "AF", "a3": "AFG", "number": "004" },
            { "name": "ALBANIA", "a2": "AL", "a3": "ALB", "number": "008" },
            { "name": "ALGERIA", "a2": "DZ", "a3": "DZA", "number": "012" },
            { "name": "AMERICAN SAMOA", "a2": "AS", "a3": "ASM", "number": "016" },
            { "name": "ANDORRA", "a2": "AD", "a3": "AND", "number": "020" },
            { "name": "ANGOLA", "a2": "AO", "a3": "AGO", "number": "024" },
            { "name": "ANGUILLA", "a2": "AI", "a3": "AIA", "number": "660" },
            { "name": "ANTARCTICA", "a2": "AQ", "a3": "ATA", "number": "010" },
            { "name": "ANTIGUA AND BARBUDA", "a2": "AG", "a3": "ATG", "number": "028" },
            { "name": "ARGENTINA", "a2": "AR", "a3": "ARG", "number": "032" },
            { "name": "ARMENIA", "a2": "AM", "a3": "ARM", "number": "051" },
            { "name": "ARUBA", "a2": "AW", "a3": "ABW", "number": "533" },
            { "name": "AUSTRALIA", "a2": "AU", "a3": "AUS", "number": "036" },
            { "name": "AUSTRIA", "a2": "AT", "a3": "AUT", "number": "040" },
            { "name": "AZERBAIJAN", "a2": "AZ", "a3": "AZE", "number": "031" },
            { "name": "BAHAMAS", "a2": "BS", "a3": "BHS", "number": "044" },
            { "name": "BAHRAIN", "a2": "BH", "a3": "BHR", "number": "048" },
            { "name": "BANGLADESH", "a2": "BD", "a3": "BGD", "number": "050" },
            { "name": "BARBADOS", "a2": "BB", "a3": "BRB", "number": "052" },
            { "name": "BELARUS", "a2": "BY", "a3": "BLR", "number": "112" },
            { "name": "BELGIUM", "a2": "BE", "a3": "BEL", "number": "056" },
            { "name": "BELIZE", "a2": "BZ", "a3": "BLZ", "number": "084" },
            { "name": "BENIN", "a2": "BJ", "a3": "BEN", "number": "204" },
            { "name": "BERMUDA", "a2": "BM", "a3": "BMU", "number": "060" },
            { "name": "BHUTAN", "a2": "BT", "a3": "BTN", "number": "064" },
            { "name": "BOLIVIA", "a2": "BO", "a3": "BOL", "number": "068" },
            { "name": "BOSNIA AND HERZEGOWINA", "a2": "BA", "a3": "BIH", "number": "070" },
            { "name": "BOTSWANA", "a2": "BW", "a3": "BWA", "number": "072" },
            { "name": "BOUVET ISLAND", "a2": "BV", "a3": "BVT", "number": "074" },
            { "name": "BRAZIL", "a2": "BR", "a3": "BRA", "number": "076" },
            { "name": "BRITISH INDIAN OCEAN TERRITORY", "a2": "IO", "a3": "IOT", "number": "086" },
            { "name": "BRUNEI DARUSSALAM", "a2": "BN", "a3": "BRN", "number": "096" },
            { "name": "BULGARIA", "a2": "BG", "a3": "BGR", "number": "100" },
            { "name": "BURKINA FASO", "a2": "BF", "a3": "BFA", "number": "854" },
            { "name": "BURUNDI", "a2": "BI", "a3": "BDI", "number": "108" },
            { "name": "CAMBODIA", "a2": "KH", "a3": "KHM", "number": "116" },
            { "name": "CAMEROON", "a2": "CM", "a3": "CMR", "number": "120" },
            { "name": "CANADA", "a2": "CA", "a3": "CAN", "number": "124" },
            { "name": "CAPE VERDE", "a2": "CV", "a3": "CPV", "number": "132" },
            { "name": "CAYMAN ISLANDS", "a2": "KY", "a3": "CYM", "number": "136" },
            { "name": "CENTRAL AFRICAN REPUBLIC", "a2": "CF", "a3": "CAF", "number": "140" },
            { "name": "CHAD", "a2": "TD", "a3": "TCD", "number": "148" },
            { "name": "CHILE", "a2": "CL", "a3": "CHL", "number": "152" },
            { "name": "CHINA", "a2": "CN", "a3": "CHN", "number": "156" },
            { "name": "CHRISTMAS ISLAND", "a2": "CX", "a3": "CXR", "number": "162" },
            { "name": "COCOS (KEELING) ISLANDS", "a2": "CC", "a3": "CCK", "number": "166" },
            { "name": "COLOMBIA", "a2": "CO", "a3": "COL", "number": "170" },
            { "name": "COMOROS", "a2": "KM", "a3": "COM", "number": "174" },
            { "name": "CONGO, Democratic Republic of (was Zaire)", "a2": "CD", "a3": "COD", "number": "180" },
            { "name": "CONGO, Republic of", "a2": "CG", "a3": "COG", "number": "178" },
            { "name": "COOK ISLANDS", "a2": "CK", "a3": "COK", "number": "184" },
            { "name": "COSTA RICA", "a2": "CR", "a3": "CRI", "number": "188" },
            { "name": "COTE D'IVOIRE", "a2": "CI", "a3": "CIV", "number": "384" },
            { "name": "CROATIA (local name: Hrvatska)", "a2": "HR", "a3": "HRV", "number": "191" },
            { "name": "CUBA", "a2": "CU", "a3": "CUB", "number": "192" },
            { "name": "CYPRUS", "a2": "CY", "a3": "CYP", "number": "196" },
            { "name": "CZECH REPUBLIC", "a2": "CZ", "a3": "CZE", "number": "203" },
            { "name": "DENMARK", "a2": "DK", "a3": "DNK", "number": "208" },
            { "name": "DJIBOUTI", "a2": "DJ", "a3": "DJI", "number": "262" },
            { "name": "DOMINICA", "a2": "DM", "a3": "DMA", "number": "212" },
            { "name": "DOMINICAN REPUBLIC", "a2": "DO", "a3": "DOM", "number": "214" },
            { "name": "ECUADOR", "a2": "EC", "a3": "ECU", "number": "218" },
            { "name": "EGYPT", "a2": "EG", "a3": "EGY", "number": "818" },
            { "name": "EL SALVADOR", "a2": "SV", "a3": "SLV", "number": "222" },
            { "name": "EQUATORIAL GUINEA", "a2": "GQ", "a3": "GNQ", "number": "226" },
            { "name": "ERITREA", "a2": "ER", "a3": "ERI", "number": "232" },
            { "name": "ESTONIA", "a2": "EE", "a3": "EST", "number": "233" },
            { "name": "ETHIOPIA", "a2": "ET", "a3": "ETH", "number": "231" },
            { "name": "FALKLAND ISLANDS (MALVINAS)", "a2": "FK", "a3": "FLK", "number": "238" },
            { "name": "FAROE ISLANDS", "a2": "FO", "a3": "FRO", "number": "234" },
            { "name": "FIJI", "a2": "FJ", "a3": "FJI", "number": "242" },
            { "name": "FINLAND", "a2": "FI", "a3": "FIN", "number": "246" },
            { "name": "FRANCE", "a2": "FR", "a3": "FRA", "number": "250" },
            { "name": "FRENCH GUIANA", "a2": "GF", "a3": "GUF", "number": "254" },
            { "name": "FRENCH POLYNESIA", "a2": "PF", "a3": "PYF", "number": "258" },
            { "name": "FRENCH SOUTHERN TERRITORIES", "a2": "TF", "a3": "ATF", "number": "260" },
            { "name": "GABON", "a2": "GA", "a3": "GAB", "number": "266" },
            { "name": "GAMBIA", "a2": "GM", "a3": "GMB", "number": "270" },
            { "name": "GEORGIA", "a2": "GE", "a3": "GEO", "number": "268" },
            { "name": "GERMANY", "a2": "DE", "a3": "DEU", "number": "276" },
            { "name": "GHANA", "a2": "GH", "a3": "GHA", "number": "288" },
            { "name": "GIBRALTAR", "a2": "GI", "a3": "GIB", "number": "292" },
            { "name": "GREECE", "a2": "GR", "a3": "GRC", "number": "300" },
            { "name": "GREENLAND", "a2": "GL", "a3": "GRL", "number": "304" },
            { "name": "GRENADA", "a2": "GD", "a3": "GRD", "number": "308" },
            { "name": "GUADELOUPE", "a2": "GP", "a3": "GLP", "number": "312" },
            { "name": "GUAM", "a2": "GU", "a3": "GUM", "number": "316" },
            { "name": "GUATEMALA", "a2": "GT", "a3": "GTM", "number": "320" },
            { "name": "GUINEA", "a2": "GN", "a3": "GIN", "number": "324" },
            { "name": "GUINEA-BISSAU", "a2": "GW", "a3": "GNB", "number": "624" },
            { "name": "GUYANA", "a2": "GY", "a3": "GUY", "number": "328" },
            { "name": "HAITI", "a2": "HT", "a3": "HTI", "number": "332" },
            { "name": "HEARD AND MC DONALD ISLANDS", "a2": "HM", "a3": "HMD", "number": "334" },
            { "name": "HONDURAS", "a2": "HN", "a3": "HND", "number": "340" },
            { "name": "HONG KONG", "a2": "HK", "a3": "HKG", "number": "344" },
            { "name": "HUNGARY", "a2": "HU", "a3": "HUN", "number": "348" },
            { "name": "ICELAND", "a2": "IS", "a3": "ISL", "number": "352" },
            { "name": "INDIA", "a2": "IN", "a3": "IND", "number": "356" },
            { "name": "INDONESIA", "a2": "ID", "a3": "IDN", "number": "360" },
            { "name": "IRAN (ISLAMIC REPUBLIC OF)", "a2": "IR", "a3": "IRN", "number": "364" },
            { "name": "IRAQ", "a2": "IQ", "a3": "IRQ", "number": "368" },
            { "name": "IRELAND", "a2": "IE", "a3": "IRL", "number": "372" },
            { "name": "ISRAEL", "a2": "IL", "a3": "ISR", "number": "376" },
            { "name": "ITALY", "a2": "IT", "a3": "ITA", "number": "380" },
            { "name": "JAMAICA", "a2": "JM", "a3": "JAM", "number": "388" },
            { "name": "JAPAN", "a2": "JP", "a3": "JPN", "number": "392" },
            { "name": "JORDAN", "a2": "JO", "a3": "JOR", "number": "400" },
            { "name": "KAZAKHSTAN", "a2": "KZ", "a3": "KAZ", "number": "398" },
            { "name": "KENYA", "a2": "KE", "a3": "KEN", "number": "404" },
            { "name": "KIRIBATI", "a2": "KI", "a3": "KIR", "number": "296" },
            { "name": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF", "a2": "KP", "a3": "PRK", "number": "408" },
            { "name": "KOREA, REPUBLIC OF", "a2": "KR", "a3": "KOR", "number": "410" },
            { "name": "KUWAIT", "a2": "KW", "a3": "KWT", "number": "414" },
            { "name": "KYRGYZSTAN", "a2": "KG", "a3": "KGZ", "number": "417" },
            { "name": "LAO PEOPLE'S DEMOCRATIC REPUBLIC", "a2": "LA", "a3": "LAO", "number": "418" },
            { "name": "LATVIA", "a2": "LV", "a3": "LVA", "number": "428" },
            { "name": "LEBANON", "a2": "LB", "a3": "LBN", "number": "422" },
            { "name": "LESOTHO", "a2": "LS", "a3": "LSO", "number": "426" },
            { "name": "LIBERIA", "a2": "LR", "a3": "LBR", "number": "430" },
            { "name": "LIBYAN ARAB JAMAHIRIYA", "a2": "LY", "a3": "LBY", "number": "434" },
            { "name": "LIECHTENSTEIN", "a2": "LI", "a3": "LIE", "number": "438" },
            { "name": "LITHUANIA", "a2": "LT", "a3": "LTU", "number": "440" },
            { "name": "LUXEMBOURG", "a2": "LU", "a3": "LUX", "number": "442" },
            { "name": "MACAU", "a2": "MO", "a3": "MAC", "number": "446" },
            { "name": "MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF", "a2": "MK", "a3": "MKD", "number": "807" },
            { "name": "MADAGASCAR", "a2": "MG", "a3": "MDG", "number": "450" },
            { "name": "MALAWI", "a2": "MW", "a3": "MWI", "number": "454" },
            { "name": "MALAYSIA", "a2": "MY", "a3": "MYS", "number": "458" },
            { "name": "MALDIVES", "a2": "MV", "a3": "MDV", "number": "462" },
            { "name": "MALI", "a2": "ML", "a3": "MLI", "number": "466" },
            { "name": "MALTA", "a2": "MT", "a3": "MLT", "number": "470" },
            { "name": "MARSHALL ISLANDS", "a2": "MH", "a3": "MHL", "number": "584" },
            { "name": "MARTINIQUE", "a2": "MQ", "a3": "MTQ", "number": "474" },
            { "name": "MAURITANIA", "a2": "MR", "a3": "MRT", "number": "478" },
            { "name": "MAURITIUS", "a2": "MU", "a3": "MUS", "number": "480" },
            { "name": "MAYOTTE", "a2": "YT", "a3": "MYT", "number": "175" },
            { "name": "MEXICO", "a2": "MX", "a3": "MEX", "number": "484" },
            { "name": "MICRONESIA, FEDERATED STATES OF", "a2": "FM", "a3": "FSM", "number": "583" },
            { "name": "MOLDOVA, REPUBLIC OF", "a2": "MD", "a3": "MDA", "number": "498" },
            { "name": "MONACO", "a2": "MC", "a3": "MCO", "number": "492" },
            { "name": "MONGOLIA", "a2": "MN", "a3": "MNG", "number": "496" },
            { "name": "MONTSERRAT", "a2": "MS", "a3": "MSR", "number": "500" },
            { "name": "MOROCCO", "a2": "MA", "a3": "MAR", "number": "504" },
            { "name": "MOZAMBIQUE", "a2": "MZ", "a3": "MOZ", "number": "508" },
            { "name": "MYANMAR", "a2": "MM", "a3": "MMR", "number": "104" },
            { "name": "NAMIBIA", "a2": "NA", "a3": "NAM", "number": "516" },
            { "name": "NAURU", "a2": "NR", "a3": "NRU", "number": "520" },
            { "name": "NEPAL", "a2": "NP", "a3": "NPL", "number": "524" },
            { "name": "NETHERLANDS", "a2": "NL", "a3": "NLD", "number": "528" },
            { "name": "NETHERLANDS ANTILLES", "a2": "AN", "a3": "ANT", "number": "530" },
            { "name": "NEW CALEDONIA", "a2": "NC", "a3": "NCL", "number": "540" },
            { "name": "NEW ZEALAND", "a2": "NZ", "a3": "NZL", "number": "554" },
            { "name": "NICARAGUA", "a2": "NI", "a3": "NIC", "number": "558" },
            { "name": "NIGER", "a2": "NE", "a3": "NER", "number": "562" },
            { "name": "NIGERIA", "a2": "NG", "a3": "NGA", "number": "566" },
            { "name": "NIUE", "a2": "NU", "a3": "NIU", "number": "570" },
            { "name": "NORFOLK ISLAND", "a2": "NF", "a3": "NFK", "number": "574" },
            { "name": "NORTHERN MARIANA ISLANDS", "a2": "MP", "a3": "MNP", "number": "580" },
            { "name": "NORWAY", "a2": "NO", "a3": "NOR", "number": "578" },
            { "name": "OMAN", "a2": "OM", "a3": "OMN", "number": "512" },
            { "name": "PAKISTAN", "a2": "PK", "a3": "PAK", "number": "586" },
            { "name": "PALAU", "a2": "PW", "a3": "PLW", "number": "585" },
            { "name": "PALESTINIAN TERRITORY, Occupied", "a2": "PS", "a3": "PSE", "number": "275" },
            { "name": "PANAMA", "a2": "PA", "a3": "PAN", "number": "591" },
            { "name": "PAPUA NEW GUINEA", "a2": "PG", "a3": "PNG", "number": "598" },
            { "name": "PARAGUAY", "a2": "PY", "a3": "PRY", "number": "600" },
            { "name": "PERU", "a2": "PE", "a3": "PER", "number": "604" },
            { "name": "PHILIPPINES", "a2": "PH", "a3": "PHL", "number": "608" },
            { "name": "PITCAIRN", "a2": "PN", "a3": "PCN", "number": "612" },
            { "name": "POLAND", "a2": "PL", "a3": "POL", "number": "616" },
            { "name": "PORTUGAL", "a2": "PT", "a3": "PRT", "number": "620" },
            { "name": "PUERTO RICO", "a2": "PR", "a3": "PRI", "number": "630" },
            { "name": "QATAR", "a2": "QA", "a3": "QAT", "number": "634" },
            { "name": "REUNION", "a2": "RE", "a3": "REU", "number": "638" },
            { "name": "ROMANIA", "a2": "RO", "a3": "ROU", "number": "642" },
            { "name": "RUSSIAN FEDERATION", "a2": "RU", "a3": "RUS", "number": "643" },
            { "name": "RWANDA", "a2": "RW", "a3": "RWA", "number": "646" },
            { "name": "SAINT HELENA", "a2": "SH", "a3": "SHN", "number": "654" },
            { "name": "SAINT KITTS AND NEVIS", "a2": "KN", "a3": "KNA", "number": "659" },
            { "name": "SAINT LUCIA", "a2": "LC", "a3": "LCA", "number": "662" },
            { "name": "SAINT PIERRE AND MIQUELON", "a2": "PM", "a3": "SPM", "number": "666" },
            { "name": "SAINT VINCENT AND THE GRENADINES", "a2": "VC", "a3": "VCT", "number": "670" },
            { "name": "SAMOA", "a2": "WS", "a3": "WSM", "number": "882" },
            { "name": "SAN MARINO", "a2": "SM", "a3": "SMR", "number": "674" },
            { "name": "SAO TOME AND PRINCIPE", "a2": "ST", "a3": "STP", "number": "678" },
            { "name": "SAUDI ARABIA", "a2": "SA", "a3": "SAU", "number": "682" },
            { "name": "SENEGAL", "a2": "SN", "a3": "SEN", "number": "686" },
            { "name": "SERBIA AND MONTENEGRO", "a2": "CS", "a3": "SCG", "number": "891" },
            { "name": "SEYCHELLES", "a2": "SC", "a3": "SYC", "number": "690" },
            { "name": "SIERRA LEONE", "a2": "SL", "a3": "SLE", "number": "694" },
            { "name": "SINGAPORE", "a2": "SG", "a3": "SGP", "number": "702" },
            { "name": "SLOVAKIA", "a2": "SK", "a3": "SVK", "number": "703" },
            { "name": "SLOVENIA", "a2": "SI", "a3": "SVN", "number": "705" },
            { "name": "SOLOMON ISLANDS", "a2": "SB", "a3": "SLB", "number": "090" },
            { "name": "SOMALIA", "a2": "SO", "a3": "SOM", "number": "706" },
            { "name": "SOUTH AFRICA", "a2": "ZA", "a3": "ZAF", "number": "710" },
            { "name": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS", "a2": "GS", "a3": "SGS", "number": "239" },
            { "name": "SPAIN", "a2": "ES", "a3": "ESP", "number": "724" },
            { "name": "SRI LANKA", "a2": "LK", "a3": "LKA", "number": "144" },
            { "name": "SUDAN", "a2": "SD", "a3": "SDN", "number": "736" },
            { "name": "SURINAME", "a2": "SR", "a3": "SUR", "number": "740" },
            { "name": "SVALBARD AND JAN MAYEN ISLANDS", "a2": "SJ", "a3": "SJM", "number": "744" },
            { "name": "SWAZILAND", "a2": "SZ", "a3": "SWZ", "number": "748" },
            { "name": "SWEDEN", "a2": "SE", "a3": "SWE", "number": "752" },
            { "name": "SWITZERLAND", "a2": "CH", "a3": "CHE", "number": "756" },
            { "name": "SYRIAN ARAB REPUBLIC", "a2": "SY", "a3": "SYR", "number": "760" },
            { "name": "TAIWAN", "a2": "TW", "a3": "TWN", "number": "158" },
            { "name": "TAJIKISTAN", "a2": "TJ", "a3": "TJK", "number": "762" },
            { "name": "TANZANIA, UNITED REPUBLIC OF", "a2": "TZ", "a3": "TZA", "number": "834" },
            { "name": "THAILAND", "a2": "TH", "a3": "THA", "number": "764" },
            { "name": "TIMOR-LESTE", "a2": "TL", "a3": "TLS", "number": "626" },
            { "name": "TOGO", "a2": "TG", "a3": "TGO", "number": "768" },
            { "name": "TOKELAU", "a2": "TK", "a3": "TKL", "number": "772" },
            { "name": "TONGA", "a2": "TO", "a3": "TON", "number": "776" },
            { "name": "TRINIDAD AND TOBAGO", "a2": "TT", "a3": "TTO", "number": "780" },
            { "name": "TUNISIA", "a2": "TN", "a3": "TUN", "number": "788" },
            { "name": "TURKEY", "a2": "TR", "a3": "TUR", "number": "792" },
            { "name": "TURKMENISTAN", "a2": "TM", "a3": "TKM", "number": "795" },
            { "name": "TURKS AND CAICOS ISLANDS", "a2": "TC", "a3": "TCA", "number": "796" },
            { "name": "TUVALU", "a2": "TV", "a3": "TUV", "number": "798" },
            { "name": "UGANDA", "a2": "UG", "a3": "UGA", "number": "800" },
            { "name": "UKRAINE", "a2": "UA", "a3": "UKR", "number": "804" },
            { "name": "UNITED ARAB EMIRATES", "a2": "AE", "a3": "ARE", "number": "784" },
            { "name": "UNITED KINGDOM", "a2": "GB", "a3": "GBR", "number": "826" },
            { "name": "UNITED STATES", "a2": "US", "a3": "USA", "number": "840" },
            { "name": "UNITED STATES MINOR OUTLYING ISLANDS", "a2": "UM", "a3": "UMI", "number": "581" },
            { "name": "URUGUAY", "a2": "UY", "a3": "URY", "number": "858" },
            { "name": "UZBEKISTAN", "a2": "UZ", "a3": "UZB", "number": "860" },
            { "name": "VANUATU", "a2": "VU", "a3": "VUT", "number": "548" },
            { "name": "VATICAN CITY STATE (HOLY SEE)", "a2": "VA", "a3": "VAT", "number": "336" },
            { "name": "VENEZUELA", "a2": "VE", "a3": "VEN", "number": "862" },
            { "name": "VIET NAM", "a2": "VN", "a3": "VNM", "number": "704" },
            { "name": "VIRGIN ISLANDS (BRITISH)", "a2": "VG", "a3": "VGB", "number": "092" },
            { "name": "VIRGIN ISLANDS (U.S.)", "a2": "VI", "a3": "VIR", "number": "850" },
            { "name": "WALLIS AND FUTUNA ISLANDS", "a2": "WF", "a3": "WLF", "number": "876" },
            { "name": "WESTERN SAHARA", "a2": "EH", "a3": "ESH", "number": "732" },
            { "name": "YEMEN", "a2": "YE", "a3": "YEM", "number": "887" },
            { "name": "ZAMBIA", "a2": "ZM", "a3": "ZMB", "number": "894" },
            { "name": "ZIMBABWE", "a2": "ZW", "a3": "ZWE", "number": "716" }
        ]);

    /**
     * Provides access and search function to ISO 3166 codes.
     *
     * @name CodeService
     * @memberOf dff/iso/3166
     * @constructs
     */
    dff.define('dff.iso.3166.CodeService', function () {
        var self = {};
        var noregex = /^[0-9]{3}$/;

        /**
         * Searches through ISO 3166 country code list and returns code object.
         * Any property of a code object can be given: number, a2, a3, name
         *
         * @name getCountryCode
         * @memberOf dff/iso/3166.CodeService
         * @function
         * @instance
         *
         * @param {string} code Code to search properties of code objects for.
         * @return {Object} Code object found for given code or undefined if nothing is found.
         */
        self.getCountryCode= function (code) {
            if (typeof code === "string") {

                // search by number
                if (noregex.test(code)) {
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.number === code;
                    });
                }
                // search by a2
                else if (code.length === 2) {
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.a2 === code;
                    });
                }
                // search by a3
                else if (code.length === 3) {
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.a3 === code;
                    });
                }
                // try search by name caseinsensitive
                else {
                    var codelc = code.toLowerCase();
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.name.toLowerCase() === codelc;
                    });
                }
            }
            else if (typeof code === "number") {
                return _.find(dff.iso[3166].codes, function (isocode) {
                    return parseInt(isocode.number) === code;
                });
            }
        };

        return self;
    });