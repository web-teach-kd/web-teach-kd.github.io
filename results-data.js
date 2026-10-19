/* TimeWarp: supplied preprint. OnlineMind2Web: author-supplied numerical table. */
window.WEBKD_RESULTS = {
  "methods": [
    {
      "id": "zero_shot",
      "label": "Zero-shot"
    },
    {
      "id": "behavior_cloning",
      "label": "Behavior Cloning"
    },
    {
      "id": "behavior_cloning_tw",
      "label": "Behavior Cloning (TW)"
    },
    {
      "id": "mgrpo",
      "label": "m-GRPO"
    },
    {
      "id": "self_edit",
      "label": "Self/Student Edit"
    },
    {
      "id": "takeover",
      "label": "Off-policy Takeover"
    },
    {
      "id": "restyle",
      "label": "Student Re-style Edit"
    },
    {
      "id": "webkd",
      "label": "WEBKD"
    }
  ],
  "models": [
    {
      "id": "qwen4",
      "label": "Qwen 3.5 4B"
    },
    {
      "id": "qwen9",
      "label": "Qwen 3.5 9B"
    },
    {
      "id": "gemma",
      "label": "Gemma 4 E4B"
    }
  ],
  "timewarp": {
    "source": {
      "title": "Teaching Agents in Their Own Style: Black-Box Teacher Distillation for Web Agents",
      "label": "Table 1",
      "page": 7,
      "href": "https://arxiv.org/pdf/2610.22539#page=7",
      "metric": "Success rate",
      "unit": "percent",
      "runs": 3,
      "uncertainty": "standard error",
      "caption": "Success rate (%) on the TimeWarp test split, in domain on v6 and on the five held-out versions v1–v5. Results are averaged over three runs with the standard error as the subscript.",
      "notes": [
        "All means and standard errors are transcribed from Table 1 as printed.",
        "v6 is the seen version. Versions v1–v5 are held out.",
        "Standard errors are in percentage points."
      ]
    },
    "columns": [
      {
        "id": "v1",
        "label": "v1 (unseen)",
        "seen": false
      },
      {
        "id": "v2",
        "label": "v2 (unseen)",
        "seen": false
      },
      {
        "id": "v3",
        "label": "v3 (unseen)",
        "seen": false
      },
      {
        "id": "v4",
        "label": "v4 (unseen)",
        "seen": false
      },
      {
        "id": "v5",
        "label": "v5 (unseen)",
        "seen": false
      },
      {
        "id": "v6",
        "label": "v6 (seen)",
        "seen": true
      }
    ],
    "models": {
      "qwen4": {
        "zero_shot": {
          "v1": {
            "mean": 1.0,
            "se": 0.57
          },
          "v2": {
            "mean": 1.0,
            "se": 0.57
          },
          "v3": {
            "mean": 0.3,
            "se": 0.31
          },
          "v4": {
            "mean": 1.6,
            "se": 0.71
          },
          "v5": {
            "mean": 0.0,
            "se": 0.0
          },
          "v6": {
            "mean": 1.0,
            "se": 0.57
          }
        },
        "behavior_cloning": {
          "v1": {
            "mean": 10.7,
            "se": 1.76
          },
          "v2": {
            "mean": 9.4,
            "se": 1.66
          },
          "v3": {
            "mean": 9.7,
            "se": 1.68
          },
          "v4": {
            "mean": 10.7,
            "se": 1.76
          },
          "v5": {
            "mean": 5.2,
            "se": 1.26
          },
          "v6": {
            "mean": 9.7,
            "se": 1.68
          }
        },
        "behavior_cloning_tw": {
          "v1": {
            "mean": 27.5,
            "se": 2.54
          },
          "v2": {
            "mean": 28.5,
            "se": 2.57
          },
          "v3": {
            "mean": 27.8,
            "se": 2.55
          },
          "v4": {
            "mean": 26.2,
            "se": 2.5
          },
          "v5": {
            "mean": 28.2,
            "se": 2.56
          },
          "v6": {
            "mean": 29.8,
            "se": 2.6
          }
        },
        "mgrpo": {
          "v1": {
            "mean": 30.1,
            "se": 2.62
          },
          "v2": {
            "mean": 27.2,
            "se": 2.54
          },
          "v3": {
            "mean": 26.2,
            "se": 2.5
          },
          "v4": {
            "mean": 28.2,
            "se": 2.56
          },
          "v5": {
            "mean": 30.1,
            "se": 2.61
          },
          "v6": {
            "mean": 30.4,
            "se": 2.62
          }
        },
        "self_edit": {
          "v1": {
            "mean": 25.2,
            "se": 2.47
          },
          "v2": {
            "mean": 19.4,
            "se": 2.25
          },
          "v3": {
            "mean": 27.2,
            "se": 2.53
          },
          "v4": {
            "mean": 24.3,
            "se": 2.56
          },
          "v5": {
            "mean": 23.3,
            "se": 2.61
          },
          "v6": {
            "mean": 23.6,
            "se": 2.62
          }
        },
        "takeover": {
          "v1": {
            "mean": 24.4,
            "se": 2.45
          },
          "v2": {
            "mean": 24.3,
            "se": 2.44
          },
          "v3": {
            "mean": 25.2,
            "se": 2.48
          },
          "v4": {
            "mean": 23.3,
            "se": 2.41
          },
          "v5": {
            "mean": 27.2,
            "se": 2.54
          },
          "v6": {
            "mean": 25.6,
            "se": 2.49
          }
        },
        "restyle": {
          "v1": {
            "mean": 28.8,
            "se": 2.58
          },
          "v2": {
            "mean": 23.6,
            "se": 2.42
          },
          "v3": {
            "mean": 23.7,
            "se": 2.43
          },
          "v4": {
            "mean": 26.5,
            "se": 2.52
          },
          "v5": {
            "mean": 28.3,
            "se": 2.57
          },
          "v6": {
            "mean": 26.9,
            "se": 2.53
          }
        },
        "webkd": {
          "v1": {
            "mean": 37.9,
            "se": 2.77
          },
          "v2": {
            "mean": 36.3,
            "se": 2.73
          },
          "v3": {
            "mean": 35.3,
            "se": 2.72
          },
          "v4": {
            "mean": 38.8,
            "se": 2.77
          },
          "v5": {
            "mean": 36.9,
            "se": 2.74
          },
          "v6": {
            "mean": 41.1,
            "se": 2.8
          }
        }
      },
      "qwen9": {
        "zero_shot": {
          "v1": {
            "mean": 0.0,
            "se": 0.0
          },
          "v2": {
            "mean": 0.3,
            "se": 0.31
          },
          "v3": {
            "mean": 1.6,
            "se": 0.71
          },
          "v4": {
            "mean": 1.3,
            "se": 0.65
          },
          "v5": {
            "mean": 0.0,
            "se": 0.0
          },
          "v6": {
            "mean": 0.6,
            "se": 0.44
          }
        },
        "behavior_cloning": {
          "v1": {
            "mean": 12.3,
            "se": 1.87
          },
          "v2": {
            "mean": 10.0,
            "se": 1.71
          },
          "v3": {
            "mean": 6.8,
            "se": 1.43
          },
          "v4": {
            "mean": 11.7,
            "se": 1.82
          },
          "v5": {
            "mean": 4.9,
            "se": 1.23
          },
          "v6": {
            "mean": 12.3,
            "se": 1.87
          }
        },
        "behavior_cloning_tw": {
          "v1": {
            "mean": 25.9,
            "se": 2.49
          },
          "v2": {
            "mean": 24.3,
            "se": 2.44
          },
          "v3": {
            "mean": 22.0,
            "se": 2.36
          },
          "v4": {
            "mean": 25.2,
            "se": 2.47
          },
          "v5": {
            "mean": 26.2,
            "se": 2.5
          },
          "v6": {
            "mean": 25.2,
            "se": 2.47
          }
        },
        "mgrpo": {
          "v1": {
            "mean": 26.9,
            "se": 2.52
          },
          "v2": {
            "mean": 27.8,
            "se": 2.54
          },
          "v3": {
            "mean": 28.8,
            "se": 2.58
          },
          "v4": {
            "mean": 31.1,
            "se": 2.62
          },
          "v5": {
            "mean": 31.4,
            "se": 2.65
          },
          "v6": {
            "mean": 26.5,
            "se": 2.51
          }
        },
        "self_edit": {
          "v1": {
            "mean": 22.3,
            "se": 2.37
          },
          "v2": {
            "mean": 23.2,
            "se": 2.4
          },
          "v3": {
            "mean": 22.7,
            "se": 2.38
          },
          "v4": {
            "mean": 25.7,
            "se": 2.49
          },
          "v5": {
            "mean": 22.7,
            "se": 2.38
          },
          "v6": {
            "mean": 23.0,
            "se": 2.39
          }
        },
        "takeover": {
          "v1": {
            "mean": 28.4,
            "se": 2.57
          },
          "v2": {
            "mean": 25.4,
            "se": 2.48
          },
          "v3": {
            "mean": 29.4,
            "se": 2.59
          },
          "v4": {
            "mean": 30.1,
            "se": 2.61
          },
          "v5": {
            "mean": 27.3,
            "se": 2.53
          },
          "v6": {
            "mean": 25.0,
            "se": 2.46
          }
        },
        "restyle": {
          "v1": {
            "mean": 17.3,
            "se": 2.15
          },
          "v2": {
            "mean": 19.5,
            "se": 2.25
          },
          "v3": {
            "mean": 18.7,
            "se": 2.22
          },
          "v4": {
            "mean": 14.4,
            "se": 2.0
          },
          "v5": {
            "mean": 16.4,
            "se": 2.1
          },
          "v6": {
            "mean": 20.2,
            "se": 2.28
          }
        },
        "webkd": {
          "v1": {
            "mean": 34.6,
            "se": 2.71
          },
          "v2": {
            "mean": 32.3,
            "se": 2.66
          },
          "v3": {
            "mean": 32.4,
            "se": 2.66
          },
          "v4": {
            "mean": 34.5,
            "se": 2.7
          },
          "v5": {
            "mean": 34.9,
            "se": 2.71
          },
          "v6": {
            "mean": 34.6,
            "se": 2.71
          }
        }
      },
      "gemma": {
        "zero_shot": {
          "v1": {
            "mean": 1.9,
            "se": 0.78
          },
          "v2": {
            "mean": 7.8,
            "se": 1.53
          },
          "v3": {
            "mean": 7.8,
            "se": 1.53
          },
          "v4": {
            "mean": 1.9,
            "se": 0.77
          },
          "v5": {
            "mean": 3.9,
            "se": 1.1
          },
          "v6": {
            "mean": 2.6,
            "se": 0.9
          }
        },
        "behavior_cloning": {
          "v1": {
            "mean": 17.5,
            "se": 2.16
          },
          "v2": {
            "mean": 16.5,
            "se": 2.11
          },
          "v3": {
            "mean": 18.4,
            "se": 2.2
          },
          "v4": {
            "mean": 15.5,
            "se": 2.06
          },
          "v5": {
            "mean": 16.5,
            "se": 2.11
          },
          "v6": {
            "mean": 19.4,
            "se": 2.25
          }
        },
        "behavior_cloning_tw": {
          "v1": {
            "mean": 28.2,
            "se": 2.56
          },
          "v2": {
            "mean": 28.2,
            "se": 2.56
          },
          "v3": {
            "mean": 32.0,
            "se": 2.65
          },
          "v4": {
            "mean": 30.1,
            "se": 2.61
          },
          "v5": {
            "mean": 28.8,
            "se": 2.58
          },
          "v6": {
            "mean": 29.4,
            "se": 2.58
          }
        },
        "mgrpo": {
          "v1": {
            "mean": 16.5,
            "se": 2.11
          },
          "v2": {
            "mean": 14.6,
            "se": 2.01
          },
          "v3": {
            "mean": 17.5,
            "se": 2.16
          },
          "v4": {
            "mean": 18.4,
            "se": 2.2
          },
          "v5": {
            "mean": 14.6,
            "se": 2.01
          },
          "v6": {
            "mean": 20.7,
            "se": 2.3
          }
        },
        "self_edit": {
          "v1": {
            "mean": 22.3,
            "se": 2.37
          },
          "v2": {
            "mean": 24.3,
            "se": 2.44
          },
          "v3": {
            "mean": 21.4,
            "se": 2.33
          },
          "v4": {
            "mean": 22.3,
            "se": 2.37
          },
          "v5": {
            "mean": 21.7,
            "se": 2.34
          },
          "v6": {
            "mean": 23.0,
            "se": 2.39
          }
        },
        "takeover": {
          "v1": {
            "mean": 29.8,
            "se": 2.6
          },
          "v2": {
            "mean": 28.2,
            "se": 2.56
          },
          "v3": {
            "mean": 29.1,
            "se": 2.58
          },
          "v4": {
            "mean": 30.1,
            "se": 2.61
          },
          "v5": {
            "mean": 33.0,
            "se": 2.66
          },
          "v6": {
            "mean": 34.3,
            "se": 2.7
          }
        },
        "restyle": {
          "v1": {
            "mean": 20.4,
            "se": 2.29
          },
          "v2": {
            "mean": 25.2,
            "se": 2.47
          },
          "v3": {
            "mean": 23.3,
            "se": 2.4
          },
          "v4": {
            "mean": 24.3,
            "se": 2.45
          },
          "v5": {
            "mean": 23.3,
            "se": 2.4
          },
          "v6": {
            "mean": 28.2,
            "se": 2.56
          }
        },
        "webkd": {
          "v1": {
            "mean": 37.2,
            "se": 2.75
          },
          "v2": {
            "mean": 34.0,
            "se": 2.69
          },
          "v3": {
            "mean": 37.9,
            "se": 2.76
          },
          "v4": {
            "mean": 36.6,
            "se": 2.74
          },
          "v5": {
            "mean": 38.8,
            "se": 2.77
          },
          "v6": {
            "mean": 39.8,
            "se": 2.78
          }
        }
      }
    },
    "teacher": {
      "label": "Teacher (GPT-5.5)",
      "values": {
        "v1": {
          "mean": 71.8,
          "se": 4.43
        },
        "v2": {
          "mean": 71.8,
          "se": 4.43
        },
        "v3": {
          "mean": 68.0,
          "se": 4.6
        },
        "v4": {
          "mean": 68.0,
          "se": 4.6
        },
        "v5": {
          "mean": 69.9,
          "se": 4.52
        },
        "v6": {
          "mean": 70.9,
          "se": 4.58
        }
      }
    }
  },
  "onlineMind2Web": {
    "source": {
      "title": "OnlineMind2Web numerical results supplied by the author",
      "label": "Provided results table",
      "referenceHref": "https://arxiv.org/pdf/2610.22539#page=8",
      "figurePath": "assets/onlinemind2web-results.png",
      "metric": "Success rate",
      "unit": "fraction",
      "runs": 3,
      "uncertainty": "standard error",
      "notes": [
        "All 56 mean/standard-error pairs are transcribed from the table supplied on October 14, 2026; no plot values are digitized.",
        "Difficulty values are success rates within each subset, not contributions to overall success.",
        "Means and standard errors are stored as fractions and multiplied by 100 for percentage display.",
        "Overall means and standard errors are displayed as supplied, not reconstructed from difficulty values.",
        "Qwen 3.5 4B Takeover and Re-style overall means conflict with the weighted difficulty means and original figure; the supplied table is retained verbatim.",
        "Only Qwen 3.5 4B and 9B are reported; no Gemma values are inferred."
      ]
    },
    "exactValuesAvailable": true,
    "modelIds": [
      "qwen4",
      "qwen9"
    ],
    "categoryCounts": {
      "easy": 61,
      "medium": 106,
      "hard": 61
    },
    "totalTasks": 228,
    "methods": [
      {
        "id": "zero_shot",
        "label": "Zero-shot"
      },
      {
        "id": "behavior_cloning",
        "label": "Behavior Cloning"
      },
      {
        "id": "grpo",
        "label": "GRPO"
      },
      {
        "id": "self_edit",
        "label": "Self/Student Edit"
      },
      {
        "id": "takeover",
        "label": "Teacher Off-policy Takeover"
      },
      {
        "id": "restyle",
        "label": "Teacher Edit, Student Re-style"
      },
      {
        "id": "webkd",
        "label": "WEBKD"
      }
    ],
    "difficulties": [
      {
        "id": "overall",
        "label": "Overall"
      },
      {
        "id": "easy",
        "label": "Easy"
      },
      {
        "id": "medium",
        "label": "Medium"
      },
      {
        "id": "hard",
        "label": "Hard"
      }
    ],
    "models": {
      "qwen4": {
        "zero_shot": {
          "easy": {
            "mean": 0.082,
            "se": 0.035
          },
          "medium": {
            "mean": 0.009,
            "se": 0.009
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.026,
            "se": 0.011
          }
        },
        "behavior_cloning": {
          "easy": {
            "mean": 0.066,
            "se": 0.032
          },
          "medium": {
            "mean": 0.009,
            "se": 0.009
          },
          "hard": {
            "mean": 0.033,
            "se": 0.023
          },
          "overall": {
            "mean": 0.031,
            "se": 0.011
          }
        },
        "grpo": {
          "easy": {
            "mean": 0.038,
            "se": 0.014
          },
          "medium": {
            "mean": 0.019,
            "se": 0.008
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.019,
            "se": 0.005
          }
        },
        "self_edit": {
          "easy": {
            "mean": 0.066,
            "se": 0.032
          },
          "medium": {
            "mean": 0.009,
            "se": 0.009
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.022,
            "se": 0.01
          }
        },
        "takeover": {
          "easy": {
            "mean": 0.082,
            "se": 0.035
          },
          "medium": {
            "mean": 0.028,
            "se": 0.016
          },
          "hard": {
            "mean": 0.016,
            "se": 0.016
          },
          "overall": {
            "mean": 0.026,
            "se": 0.011
          }
        },
        "restyle": {
          "easy": {
            "mean": 0.115,
            "se": 0.041
          },
          "medium": {
            "mean": 0.019,
            "se": 0.013
          },
          "hard": {
            "mean": 0.016,
            "se": 0.016
          },
          "overall": {
            "mean": 0.039,
            "se": 0.013
          }
        },
        "webkd": {
          "easy": {
            "mean": 0.131,
            "se": 0.043
          },
          "medium": {
            "mean": 0.028,
            "se": 0.016
          },
          "hard": {
            "mean": 0.033,
            "se": 0.023
          },
          "overall": {
            "mean": 0.057,
            "se": 0.015
          }
        }
      },
      "qwen9": {
        "zero_shot": {
          "easy": {
            "mean": 0.033,
            "se": 0.013
          },
          "medium": {
            "mean": 0.0,
            "se": 0.0
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.009,
            "se": 0.004
          }
        },
        "behavior_cloning": {
          "easy": {
            "mean": 0.044,
            "se": 0.015
          },
          "medium": {
            "mean": 0.003,
            "se": 0.003
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.013,
            "se": 0.004
          }
        },
        "grpo": {
          "easy": {
            "mean": 0.049,
            "se": 0.016
          },
          "medium": {
            "mean": 0.025,
            "se": 0.009
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.024,
            "se": 0.006
          }
        },
        "self_edit": {
          "easy": {
            "mean": 0.104,
            "se": 0.023
          },
          "medium": {
            "mean": 0.006,
            "se": 0.004
          },
          "hard": {
            "mean": 0.011,
            "se": 0.008
          },
          "overall": {
            "mean": 0.034,
            "se": 0.007
          }
        },
        "takeover": {
          "easy": {
            "mean": 0.066,
            "se": 0.018
          },
          "medium": {
            "mean": 0.0,
            "se": 0.0
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.018,
            "se": 0.005
          }
        },
        "restyle": {
          "easy": {
            "mean": 0.044,
            "se": 0.015
          },
          "medium": {
            "mean": 0.013,
            "se": 0.006
          },
          "hard": {
            "mean": 0.0,
            "se": 0.0
          },
          "overall": {
            "mean": 0.018,
            "se": 0.005
          }
        },
        "webkd": {
          "easy": {
            "mean": 0.197,
            "se": 0.029
          },
          "medium": {
            "mean": 0.041,
            "se": 0.011
          },
          "hard": {
            "mean": 0.005,
            "se": 0.005
          },
          "overall": {
            "mean": 0.073,
            "se": 0.01
          }
        }
      }
    }
  }
};
