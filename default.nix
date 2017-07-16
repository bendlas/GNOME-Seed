{ stdenv, fetchFromGitHub, pkgconfig, intltool, gtk_doc, libtool, gettext
, gobjectIntrospection, gnome3, webkitgtk, readline, sqlite, dbus_glib
, mpfr }:

stdenv.mkDerivation rec {

  name = "gnome-seed";
  src = ./.;

  gnome-js-common = stdenv.mkDerivation {
    name = "gnome-js-common";
    src = fetchFromGitHub {
      owner = "GNOME";
      repo = "gnome-js-common";
      rev = "GNOME_JS_COMMON_0_1_2";
      sha256 = "1ikjc5biyd5qj2f64a4yxcl52kxdacvx92rjknyvxac1i94gijjf";
    };
    inherit nativeBuildInputs;
    configurePhase = ''
      srcdir=`pwd` \
      PKG_NAME=$name \
        gnome-autogen.sh --prefix=$out
    '';
  };

  nativeBuildInputs = [ pkgconfig libtool intltool gtk_doc gnome3.gnome_common gnome3.glib ];
  buildInputs = [ gnome3.gtk3 gnome3.gtk2 gobjectIntrospection webkitgtk gnome-js-common readline sqlite dbus_glib
                  mpfr dbus_glib <nixpkgs/pkgs/build-support/setup-hooks/separate-debug-info.sh> ];

  configurePhase = ''
    srcdir=`pwd` \
    PKG_NAME=$name \
      gnome-autogen.sh --prefix=$out --enable-gtk-doc --enable-profile --enable-profile-modules --enable-debug --with-webkit=webkit2
  '';

}
