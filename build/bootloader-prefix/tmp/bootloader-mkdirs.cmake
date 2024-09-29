# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "C:/Espressif/frameworks/esp-idf-v5.2.1/components/bootloader/subproject"
  "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader"
  "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix"
  "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix/tmp"
  "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix/src/bootloader-stamp"
  "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix/src"
  "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "C:/vscode-esp32-workspace/HTH-RelaxEDAI/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
